using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Tasks.Queries.GetTasksByBoard;

public class GetTasksByBoardQueryHandler : IRequestHandler<GetTasksByBoardQuery, Result<List<TaskListDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetTasksByBoardQueryHandler> _logger;

    public GetTasksByBoardQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetTasksByBoardQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<List<TaskListDto>>> Handle(GetTasksByBoardQuery request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to view tasks for board {BoardId} without membership", userId, request.BoardId);
            throw new ForbiddenException("You do not have access to this board");
        }

        var tasks = await _context.TaskItems
            .Include(t => t.Status)
            .Include(t => t.Type)
            .Include(t => t.Assignee)
            .Include(t => t.Labels)
                .ThenInclude(tl => tl.Label)
            .Include(t => t.SubTasks)
            .Where(t => t.BoardId == request.BoardId)
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
