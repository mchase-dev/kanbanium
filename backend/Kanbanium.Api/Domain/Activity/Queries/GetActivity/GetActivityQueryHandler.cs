using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Kanbanium.Domain.Activity.Queries.GetActivity;

public class GetActivityQueryHandler : IRequestHandler<GetActivityQuery, Result<List<ActivityDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetActivityQueryHandler> _logger;

    public GetActivityQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetActivityQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<List<ActivityDto>>> Handle(GetActivityQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetActivity");
            return Result<List<ActivityDto>>.Failure("Unauthorized");
        }

        _logger.LogInformation("Getting activity for user {UserId}", userId);

        // Get all board IDs the user is a member of
        var boardIds = await _context.BoardMembers
            .Where(bm => bm.UserId == userId)
            .Select(bm => bm.BoardId)
            .ToListAsync(cancellationToken);

        // Build query for task history from user's boards
        var query = _context.TaskHistories
            .Include(h => h.User)
            .Include(h => h.Task)
                .ThenInclude(t => t.Board)
            .Where(h => boardIds.Contains(h.Task.BoardId));

        // Apply filters
        if (!string.IsNullOrEmpty(request.BoardId) && Guid.TryParse(request.BoardId, out var boardId))
        {
            query = query.Where(h => h.Task.BoardId == boardId);
        }

        if (!string.IsNullOrEmpty(request.ActionType))
        {
            query = query.Where(h => h.Action == request.ActionType);
        }

        // Get most recent activities with limit
        var activities = await query
            .OrderByDescending(h => h.CreatedAt)
            .Take(request.Limit)
            .ToListAsync(cancellationToken);

        // Project to DTOs
        var result = activities.Select(h => new ActivityDto
        {
            Id = h.Id,
            TaskId = h.TaskId,
            TaskTitle = h.Task.Title,
            BoardId = h.Task.BoardId,
            BoardName = h.Task.Board.Name,
            UserId = h.UserId,
            Action = h.Action,
            FieldName = h.FieldName,
            OldValue = h.OldValue,
            NewValue = h.NewValue,
            CreatedAt = h.CreatedAt,
            User = new UserDto
            {
                Id = h.User.Id,
                UserName = h.User.UserName!,
                Email = h.User.Email!,
                FirstName = h.User.FirstName,
                LastName = h.User.LastName,
                AvatarUrl = h.User.AvatarUrl
            }
        }).ToList();

        _logger.LogInformation("Found {Count} activity entries for user {UserId}", result.Count, userId);

        return Result<List<ActivityDto>>.Success(result);
    }
}
