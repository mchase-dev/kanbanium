using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Sprints.Queries.GetSprintsByBoard;

public class GetSprintsByBoardQueryHandler : IRequestHandler<GetSprintsByBoardQuery, Result<List<SprintDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetSprintsByBoardQueryHandler> _logger;

    public GetSprintsByBoardQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetSprintsByBoardQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<List<SprintDto>>> Handle(GetSprintsByBoardQuery request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to view sprints for board {BoardId} without membership", userId, request.BoardId);
            throw new ForbiddenException("You do not have access to this board");
        }

        var sprints = await _context.Sprints
            .Where(s => s.BoardId == request.BoardId)
            .OrderByDescending(s => s.StartDate)
            .ToListAsync(cancellationToken);

        var sprintDtos = new List<SprintDto>();
        foreach (var sprint in sprints)
        {
            var dto = sprint.Adapt<SprintDto>();
            dto.TaskCount = await _context.TaskItems.CountAsync(t => t.SprintId == sprint.Id, cancellationToken);
            sprintDtos.Add(dto);
        }

        return Result<List<SprintDto>>.Success(sprintDtos);
    }
}
