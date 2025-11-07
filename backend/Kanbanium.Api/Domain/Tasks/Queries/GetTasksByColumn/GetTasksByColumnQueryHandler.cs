using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Tasks.Queries.GetTasksByColumn;

public class GetTasksByColumnQueryHandler : IRequestHandler<GetTasksByColumnQuery, Result<List<TaskListDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetTasksByColumnQueryHandler> _logger;

    public GetTasksByColumnQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetTasksByColumnQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<List<TaskListDto>>> Handle(GetTasksByColumnQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var column = await _context.Columns
            .Include(c => c.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(c => c.Id == request.ColumnId, cancellationToken);

        if (column == null)
        {
            throw new NotFoundException(nameof(BoardColumn), request.ColumnId);
        }

        // Verify user is a member of the board
        var isMember = column.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to view tasks for column {ColumnId} without board membership", userId, request.ColumnId);
            throw new ForbiddenException("You do not have access to this board");
        }

        var tasks = await _context.TaskItems
            .Include(t => t.Status)
            .Include(t => t.Type)
            .Include(t => t.Assignee)
            .Include(t => t.Labels)
                .ThenInclude(tl => tl.Label)
            .Include(t => t.SubTasks)
            .Where(t => t.ColumnId == request.ColumnId)
            .OrderBy(t => t.PositionIndex)
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
