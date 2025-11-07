using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Watchers.Queries.GetWatchers;

public class GetWatchersQueryHandler : IRequestHandler<GetWatchersQuery, Result<List<WatcherDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetWatchersQueryHandler> _logger;

    public GetWatchersQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetWatchersQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<List<WatcherDto>>> Handle(GetWatchersQuery request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to view watchers for task {TaskId} without board membership", userId, request.TaskId);
            throw new ForbiddenException("You do not have access to this board");
        }

        var watchers = await _context.TaskWatchers
            .Include(w => w.User)
            .Where(w => w.TaskId == request.TaskId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);

        var watcherDtos = watchers.Adapt<List<WatcherDto>>();

        return Result<List<WatcherDto>>.Success(watcherDtos);
    }
}
