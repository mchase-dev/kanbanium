using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Tasks.Commands.UpdateTask;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, Result<TaskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<UpdateTaskCommandHandler> _logger;

    public UpdateTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        INotificationService notificationService,
        ILogger<UpdateTaskCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Result<TaskDto>> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.TaskItems
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.Id);
        }

        // Verify user is a member
        var isMember = task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to update task {TaskId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
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
            var assigneeIsMember = task.Board.Members.Any(m => m.UserId == request.AssigneeId);
            if (!assigneeIsMember)
            {
                throw new BadRequestException("Assignee must be a member of the board");
            }
        }

        // Verify sprint if provided
        if (request.SprintId.HasValue)
        {
            var sprintExists = await _context.Sprints
                .AnyAsync(s => s.Id == request.SprintId.Value && s.BoardId == task.BoardId, cancellationToken);
            if (!sprintExists)
            {
                throw new NotFoundException("Sprint", request.SprintId.Value);
            }
        }

        task.Title = request.Title;
        task.Description = request.Description;
        task.StatusId = request.StatusId;
        task.TypeId = request.TypeId;
        task.SprintId = request.SprintId;
        task.AssigneeId = request.AssigneeId;
        task.Priority = request.Priority;
        task.DueDate = request.DueDate;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated task {TaskId}", userId, request.Id);

        // Send real-time notification
        await _notificationService.TaskUpdated(task.BoardId.ToString(), task.Id.ToString());

        // Reload task with all related entities for DTO
        var updatedTask = await _context.TaskItems
            .Include(t => t.Status)
            .Include(t => t.Type)
            .Include(t => t.Assignee)
            .Include(t => t.Labels)
                .ThenInclude(tl => tl.Label)
            .Include(t => t.SubTasks)
            .FirstAsync(t => t.Id == task.Id, cancellationToken);

        var taskDto = updatedTask.Adapt<TaskDto>();
        taskDto.CommentCount = await _context.Comments.CountAsync(c => c.TaskId == task.Id, cancellationToken);
        taskDto.AttachmentCount = await _context.Attachments.CountAsync(a => a.TaskId == task.Id, cancellationToken);

        return Result<TaskDto>.Success(taskDto);
    }
}
