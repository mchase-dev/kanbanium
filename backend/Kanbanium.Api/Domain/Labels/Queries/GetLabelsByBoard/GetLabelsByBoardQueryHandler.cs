using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Labels.Queries.GetLabelsByBoard;

public class GetLabelsByBoardQueryHandler : IRequestHandler<GetLabelsByBoardQuery, Result<List<LabelDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetLabelsByBoardQueryHandler> _logger;

    public GetLabelsByBoardQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetLabelsByBoardQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<List<LabelDto>>> Handle(GetLabelsByBoardQuery request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to view labels for board {BoardId} without membership", userId, request.BoardId);
            throw new ForbiddenException("You do not have access to this board");
        }

        var labels = await _context.Labels
            .Where(l => l.BoardId == request.BoardId)
            .OrderBy(l => l.Name)
            .ToListAsync(cancellationToken);

        var labelDtos = labels.Adapt<List<LabelDto>>();
        return Result<List<LabelDto>>.Success(labelDtos);
    }
}
