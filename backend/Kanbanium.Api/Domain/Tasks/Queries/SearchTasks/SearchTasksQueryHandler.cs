using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Tasks.Queries.SearchTasks;

public class SearchTasksQueryHandler : IRequestHandler<SearchTasksQuery, Result<List<TaskListDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<SearchTasksQueryHandler> _logger;

    public SearchTasksQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<SearchTasksQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<List<TaskListDto>>> Handle(SearchTasksQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var board = await _context.Boards
            .Include(b => b.Members)
            .FirstOrDefaultAsync(b => b.Id == request.BoardId, cancellationToken);

        if (board == null)
        {
            throw new NotFoundException(nameof(Board), request.BoardId);
        }

        // Verify user is a member
        var isMember = board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to search tasks for board {BoardId} without membership", userId, request.BoardId);
            throw new ForbiddenException("You do not have access to this board");
        }

        // Start with base query
        var query = _context.TaskItems
            .Include(t => t.Status)
            .Include(t => t.Type)
            .Include(t => t.Assignee)
            .Include(t => t.Labels)
                .ThenInclude(tl => tl.Label)
            .Include(t => t.SubTasks)
            .Where(t => t.BoardId == request.BoardId)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(searchTerm) ||
                (t.Description != null && t.Description.ToLower().Contains(searchTerm)));
        }

        if (request.StatusId.HasValue)
        {
            query = query.Where(t => t.StatusId == request.StatusId.Value);
        }

        if (request.TypeId.HasValue)
        {
            query = query.Where(t => t.TypeId == request.TypeId.Value);
        }

        if (!string.IsNullOrEmpty(request.AssigneeId))
        {
            query = query.Where(t => t.AssigneeId == request.AssigneeId);
        }

        if (request.Priority.HasValue)
        {
            query = query.Where(t => t.Priority == request.Priority.Value);
        }

        if (request.SprintId.HasValue)
        {
            query = query.Where(t => t.SprintId == request.SprintId.Value);
        }

        if (request.IsArchived.HasValue)
        {
            query = query.Where(t => t.IsArchived == request.IsArchived.Value);
        }

        if (request.LabelId.HasValue)
        {
            query = query.Where(t => t.Labels.Any(tl => tl.LabelId == request.LabelId.Value));
        }

        var tasks = await query
            .OrderBy(t => t.ColumnId)
            .ThenBy(t => t.PositionIndex)
            .ToListAsync(cancellationToken);

        var taskDtos = tasks.Select(t =>
        {
            var dto = t.Adapt<TaskListDto>();
            dto.SubTaskCount = t.SubTasks.Count;
            dto.CompletedSubTaskCount = t.SubTasks.Count(st => st.IsCompleted);
            return dto;
        }).ToList();

        return Result<List<TaskListDto>>.Success(taskDtos);
    }
}
