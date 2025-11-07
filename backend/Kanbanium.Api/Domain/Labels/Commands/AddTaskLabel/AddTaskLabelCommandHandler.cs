using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Labels.Commands.AddTaskLabel;

public class AddTaskLabelCommandHandler : IRequestHandler<AddTaskLabelCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AddTaskLabelCommandHandler> _logger;

    public AddTaskLabelCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<AddTaskLabelCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(AddTaskLabelCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.Tasks
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .Include(t => t.Labels)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.TaskId);
        }

        // Verify user has access to the board
        var member = task.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            _logger.LogWarning("User {UserId} attempted to add label to task {TaskId} without board membership", userId, request.TaskId);
            throw new ForbiddenException("You do not have access to this board");
        }

        // Members need at least Member role to add labels
        if (member.Role == BoardRole.Viewer)
        {
            throw new ForbiddenException("Viewers cannot add labels to tasks");
        }

        var label = await _context.Labels
            .FirstOrDefaultAsync(l => l.Id == request.LabelId, cancellationToken);

        if (label == null)
        {
            throw new NotFoundException(nameof(Label), request.LabelId);
        }

        // Verify label belongs to the same board as the task
        if (label.BoardId != task.BoardId)
        {
            throw new BadRequestException("Label does not belong to the same board as the task");
        }

        // Check if label is already added to the task
        if (task.Labels.Any(tl => tl.LabelId == request.LabelId))
        {
            throw new BadRequestException("Label is already added to this task");
        }

        var taskLabel = new TaskLabel
        {
            TaskId = request.TaskId,
            LabelId = request.LabelId,
            CreatedAt = DateTime.UtcNow
        };

        _context.TaskLabels.Add(taskLabel);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} added label {LabelId} to task {TaskId}", userId, request.LabelId, request.TaskId);

        return Result.Success();
    }
}
