using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Tasks.Commands.MoveTask;

public class MoveTaskCommandHandler : IRequestHandler<MoveTaskCommand, Result<TaskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<MoveTaskCommandHandler> _logger;

    public MoveTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        INotificationService notificationService,
        ILogger<MoveTaskCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Result<TaskDto>> Handle(MoveTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.TaskItems
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .Include(t => t.Board)
                .ThenInclude(b => b.Columns)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.Id);
        }

        // Verify user is a member
        var isMember = task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to move task {TaskId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        // Verify new column belongs to the board
        var targetColumn = task.Board.Columns.FirstOrDefault(c => c.Id == request.ColumnId);
        if (targetColumn == null)
        {
            throw new BadRequestException("Target column does not belong to this board");
        }

        var oldColumnId = task.ColumnId;
        var oldPosition = task.PositionIndex;

        // Update task column and position
        task.ColumnId = request.ColumnId;
        task.PositionIndex = request.PositionIndex;

        // If moving to a different column, adjust positions in both columns
        if (oldColumnId != request.ColumnId)
        {
            // Adjust positions in old column (shift items down)
            var oldColumnTasks = await _context.TaskItems
                .Where(t => t.ColumnId == oldColumnId && t.PositionIndex > oldPosition && t.Id != task.Id)
                .ToListAsync(cancellationToken);

            foreach (var t in oldColumnTasks)
            {
                t.PositionIndex--;
            }

            // Adjust positions in new column (shift items up to make space)
            var newColumnTasks = await _context.TaskItems
                .Where(t => t.ColumnId == request.ColumnId && t.PositionIndex >= request.PositionIndex && t.Id != task.Id)
                .ToListAsync(cancellationToken);

            foreach (var t in newColumnTasks)
            {
                t.PositionIndex++;
            }
        }
        else
        {
            // Moving within the same column
            if (oldPosition < request.PositionIndex)
            {
                // Moving down: shift items between old and new position up
                var tasksToShift = await _context.TaskItems
                    .Where(t => t.ColumnId == request.ColumnId &&
                               t.PositionIndex > oldPosition &&
                               t.PositionIndex <= request.PositionIndex &&
                               t.Id != task.Id)
                    .ToListAsync(cancellationToken);

                foreach (var t in tasksToShift)
                {
                    t.PositionIndex--;
                }
            }
            else if (oldPosition > request.PositionIndex)
            {
                // Moving up: shift items between new and old position down
                var tasksToShift = await _context.TaskItems
                    .Where(t => t.ColumnId == request.ColumnId &&
                               t.PositionIndex >= request.PositionIndex &&
                               t.PositionIndex < oldPosition &&
                               t.Id != task.Id)
                    .ToListAsync(cancellationToken);

                foreach (var t in tasksToShift)
                {
                    t.PositionIndex++;
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} moved task {TaskId} from column {OldColumnId}:{OldPosition} to {NewColumnId}:{NewPosition}",
            userId, request.Id, oldColumnId, oldPosition, request.ColumnId, request.PositionIndex);

        // Send real-time notification
        await _notificationService.TaskMoved(task.BoardId.ToString(), task.Id.ToString(), oldColumnId.ToString(), request.ColumnId.ToString());

        // Reload task with all related data
        var updatedTask = await _context.TaskItems
            .Include(t => t.Status)
            .Include(t => t.Type)
            .Include(t => t.Assignee)
            .Include(t => t.Labels)
                .ThenInclude(tl => tl.Label)
            .Include(t => t.SubTasks)
            .FirstAsync(t => t.Id == request.Id, cancellationToken);

        var taskDto = updatedTask.Adapt<TaskDto>();
        taskDto.CommentCount = await _context.Comments.CountAsync(c => c.TaskId == task.Id, cancellationToken);
        taskDto.AttachmentCount = await _context.Attachments.CountAsync(a => a.TaskId == task.Id, cancellationToken);

        return Result<TaskDto>.Success(taskDto);
    }
}
