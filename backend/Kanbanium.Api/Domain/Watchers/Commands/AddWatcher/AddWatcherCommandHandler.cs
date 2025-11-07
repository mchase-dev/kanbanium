using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Watchers.Commands.AddWatcher;

public class AddWatcherCommandHandler : IRequestHandler<AddWatcherCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AddWatcherCommandHandler> _logger;

    public AddWatcherCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<AddWatcherCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(AddWatcherCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.TaskItems
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .Include(t => t.Watchers)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.TaskId);
        }

        // Verify user is a board member
        var isMember = task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to watch task {TaskId} without board membership", userId, request.TaskId);
            throw new ForbiddenException("You do not have access to this board");
        }

        // Check if already watching
        if (task.Watchers.Any(w => w.UserId == userId))
        {
            return Result<bool>.Success(true); // Already watching, no action needed
        }

        var watcher = new TaskWatcher
        {
            TaskId = request.TaskId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.TaskWatchers.Add(watcher);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} started watching task {TaskId}", userId, request.TaskId);

        return Result<bool>.Success(true);
    }
}
