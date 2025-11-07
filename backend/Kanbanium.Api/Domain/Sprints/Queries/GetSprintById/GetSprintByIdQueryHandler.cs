using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Sprints.Queries.GetSprintById;

public class GetSprintByIdQueryHandler : IRequestHandler<GetSprintByIdQuery, Result<SprintDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetSprintByIdQueryHandler> _logger;

    public GetSprintByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetSprintByIdQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SprintDto>> Handle(GetSprintByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var sprint = await _context.Sprints
            .Include(s => s.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (sprint == null)
        {
            throw new NotFoundException(nameof(Sprint), request.Id);
        }

        // Verify user is a board member
        var isMember = sprint.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to view sprint {SprintId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        var sprintDto = sprint.Adapt<SprintDto>();
        sprintDto.TaskCount = await _context.TaskItems.CountAsync(t => t.SprintId == sprint.Id, cancellationToken);

        return Result<SprintDto>.Success(sprintDto);
    }
}
