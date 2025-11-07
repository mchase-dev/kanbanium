using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Labels.Commands.RemoveTaskLabel;

public class RemoveTaskLabelCommandHandler : IRequestHandler<RemoveTaskLabelCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<RemoveTaskLabelCommandHandler> _logger;

    public RemoveTaskLabelCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<RemoveTaskLabelCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(RemoveTaskLabelCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.Tasks
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.TaskId);
        }

        // Verify user has access to the board
        var member = task.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            _logger.LogWarning("User {UserId} attempted to remove label from task {TaskId} without board membership", userId, request.TaskId);
            throw new ForbiddenException("You do not have access to this board");
        }

        // Members need at least Member role to remove labels
        if (member.Role == BoardRole.Viewer)
        {
            throw new ForbiddenException("Viewers cannot remove labels from tasks");
        }

        var taskLabel = await _context.TaskLabels
            .FirstOrDefaultAsync(tl => tl.TaskId == request.TaskId && tl.LabelId == request.LabelId, cancellationToken);

        if (taskLabel == null)
        {
            throw new NotFoundException("Task label association not found");
        }

        _context.TaskLabels.Remove(taskLabel);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} removed label {LabelId} from task {TaskId}", userId, request.LabelId, request.TaskId);

        return Result.Success();
    }
}
