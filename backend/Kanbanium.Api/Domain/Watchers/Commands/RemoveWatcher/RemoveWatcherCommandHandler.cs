using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Watchers.Commands.RemoveWatcher;

public class RemoveWatcherCommandHandler : IRequestHandler<RemoveWatcherCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<RemoveWatcherCommandHandler> _logger;

    public RemoveWatcherCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<RemoveWatcherCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(RemoveWatcherCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.TaskItems
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.TaskId);
        }

        // Verify user is a board member
        var isMember = task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to unwatch task {TaskId} without board membership", userId, request.TaskId);
            throw new ForbiddenException("You do not have access to this board");
        }

        var watcher = await _context.TaskWatchers
            .FirstOrDefaultAsync(w => w.TaskId == request.TaskId && w.UserId == userId, cancellationToken);

        if (watcher == null)
        {
            return Result<bool>.Success(true); // Not watching, no action needed
        }

        _context.TaskWatchers.Remove(watcher);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} stopped watching task {TaskId}", userId, request.TaskId);

        return Result<bool>.Success(true);
    }
}
