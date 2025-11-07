using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Kanbanium.Domain.Tasks.Queries.GetMyTasks;

public class GetMyTasksQueryHandler : IRequestHandler<GetMyTasksQuery, Result<List<MyTaskDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetMyTasksQueryHandler> _logger;

    public GetMyTasksQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetMyTasksQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<List<MyTaskDto>>> Handle(GetMyTasksQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetMyTasks");
            return Result<List<MyTaskDto>>.Failure("Unauthorized");
        }

        _logger.LogInformation("Getting tasks for user {UserId}", userId);

        // Get all board IDs the user is a member of
        var boardIds = await _context.BoardMembers
            .Where(bm => bm.UserId == userId)
            .Select(bm => bm.BoardId)
            .ToListAsync(cancellationToken);

        // Build query for tasks assigned to current user in their boards
        var query = _context.TaskItems
            .Include(t => t.Status)
            .Include(t => t.Type)
            .Include(t => t.Board)
            .Include(t => t.Labels)
                .ThenInclude(tl => tl.Label)
            .Include(t => t.SubTasks)
            .Where(t => boardIds.Contains(t.BoardId) && t.AssigneeId == userId && !t.IsArchived);

        // Apply filters
        if (!string.IsNullOrEmpty(request.BoardId) && Guid.TryParse(request.BoardId, out var boardId))
        {
            query = query.Where(t => t.BoardId == boardId);
        }

        if (!string.IsNullOrEmpty(request.StatusId) && Guid.TryParse(request.StatusId, out var statusId))
        {
            query = query.Where(t => t.StatusId == statusId);
        }

        if (request.Priority.HasValue)
        {
            query = query.Where(t => (int)t.Priority == request.Priority.Value);
        }

        if (request.IsOverdue.HasValue && request.IsOverdue.Value)
        {
            var now = DateTime.UtcNow;
            query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value < now);
        }

        // Fetch data
        var tasks = await query.ToListAsync(cancellationToken);

        // Project to DTOs
        var now2 = DateTime.UtcNow;
        var result = tasks.Select(t => new MyTaskDto
        {
            Id = t.Id,
            Title = t.Title,
            BoardId = t.BoardId,
            BoardName = t.Board.Name,
            ColumnId = t.ColumnId,
            StatusId = t.StatusId,
            TypeId = t.TypeId,
            Priority = t.Priority,
            DueDate = t.DueDate,
            CreatedAt = t.CreatedAt,
            IsOverdue = t.DueDate.HasValue && t.DueDate.Value < now2,
            Status = new StatusDto
            {
                Id = t.Status.Id,
                Name = t.Status.Name,
                Category = t.Status.Category,
                Color = t.Status.Color
            },
            Type = new TaskTypeDto
            {
                Id = t.Type.Id,
                Name = t.Type.Name,
                Icon = t.Type.Icon,
                Color = t.Type.Color
            },
            Labels = t.Labels.Select(tl => new TaskLabelDto
            {
                TaskId = tl.TaskId,
                LabelId = tl.LabelId,
                Label = new LabelDto
                {
                    Id = tl.Label.Id,
                    Name = tl.Label.Name,
                    Color = tl.Label.Color,
                    BoardId = tl.Label.BoardId ?? Guid.Empty
                }
            }).ToList(),
            SubTaskCount = t.SubTasks.Count,
            CompletedSubTaskCount = t.SubTasks.Count(st => st.IsCompleted)
        }).ToList();

        // Apply sorting
        result = request.SortBy?.ToLower() switch
        {
            "priority" => result.OrderByDescending(t => t.Priority).ThenBy(t => t.DueDate).ToList(),
            "createdat" => result.OrderByDescending(t => t.CreatedAt).ToList(),
            _ => result.OrderBy(t => t.DueDate.HasValue ? 0 : 1).ThenBy(t => t.DueDate).ToList() // DueDate nulls last
        };

        _logger.LogInformation("Found {Count} tasks for user {UserId}", result.Count, userId);

        return Result<List<MyTaskDto>>.Success(result);
    }
}
