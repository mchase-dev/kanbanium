using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Tasks.Commands.CreateTask;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Result<TaskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<CreateTaskCommandHandler> _logger;

    public CreateTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        INotificationService notificationService,
        ILogger<CreateTaskCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Result<TaskDto>> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        // Verify board exists and user is a member
        var board = await _context.Boards
            .Include(b => b.Members)
            .Include(b => b.Columns)
            .FirstOrDefaultAsync(b => b.Id == request.BoardId, cancellationToken);

        if (board == null)
        {
            throw new NotFoundException(nameof(Board), request.BoardId);
        }

        var isMember = board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to create task on board {BoardId} without membership", userId, request.BoardId);
            throw new ForbiddenException("You do not have access to this board");
        }

        // Verify column belongs to board
        var column = board.Columns.FirstOrDefault(c => c.Id == request.ColumnId);
        if (column == null)
        {
            throw new BadRequestException("Column does not belong to this board");
        }

        // Verify status and type exist
        var statusExists = await _context.Statuses.AnyAsync(s => s.Id == request.StatusId, cancellationToken);
        if (!statusExists)
        {
            throw new NotFoundException("Status", request.StatusId);
        }

        var typeExists = await _context.TaskTypes.AnyAsync(t => t.Id == request.TypeId, cancellationToken);
        if (!typeExists)
        {
            throw new NotFoundException("TaskType", request.TypeId);
        }

        // Verify assignee if provided
        if (!string.IsNullOrEmpty(request.AssigneeId))
        {
            var assigneeIsMember = board.Members.Any(m => m.UserId == request.AssigneeId);
            if (!assigneeIsMember)
            {
                throw new BadRequestException("Assignee must be a member of the board");
            }
        }

        // Verify sprint if provided
        if (request.SprintId.HasValue)
        {
            var sprintExists = await _context.Sprints
                .AnyAsync(s => s.Id == request.SprintId.Value && s.BoardId == request.BoardId, cancellationToken);
            if (!sprintExists)
            {
                throw new NotFoundException("Sprint", request.SprintId.Value);
            }
        }

        // Calculate position index
        var maxPosition = await _context.TaskItems
            .Where(t => t.ColumnId == request.ColumnId)
            .MaxAsync(t => (int?)t.PositionIndex, cancellationToken) ?? -1;

        var task = new TaskItem
        {
            BoardId = request.BoardId,
            ColumnId = request.ColumnId,
            Title = request.Title,
            Description = request.Description,
            StatusId = request.StatusId,
            TypeId = request.TypeId,
            SprintId = request.SprintId,
            AssigneeId = request.AssigneeId,
            Priority = request.Priority,
            DueDate = request.DueDate,
            PositionIndex = maxPosition + 1
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} created task {TaskId} on board {BoardId}", userId, task.Id, request.BoardId);

        // Send real-time notification
        await _notificationService.TaskCreated(task.BoardId.ToString(), task.Id.ToString());

        // Reload task with all related entities for DTO
        var createdTask = await _context.TaskItems
            .Include(t => t.Status)
            .Include(t => t.Type)
            .Include(t => t.Assignee)
            .Include(t => t.Labels)
                .ThenInclude(tl => tl.Label)
            .Include(t => t.SubTasks)
            .FirstAsync(t => t.Id == task.Id, cancellationToken);

        var taskDto = createdTask.Adapt<TaskDto>();
        taskDto.CommentCount = 0;
        taskDto.AttachmentCount = 0;

        return Result<TaskDto>.Success(taskDto);
    }
}
