using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Boards.Queries.GetBoardById;

public class GetBoardByIdQueryHandler : IRequestHandler<GetBoardByIdQuery, Result<BoardDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetBoardByIdQueryHandler> _logger;

    public GetBoardByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetBoardByIdQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<BoardDto>> Handle(GetBoardByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var board = await _context.Boards
            .Include(b => b.Columns.OrderBy(c => c.Position))
            .Include(b => b.Members)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);

        if (board == null)
        {
            throw new NotFoundException(nameof(Board), request.Id);
        }

        // Verify user is a member of the board
        var isMember = board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to access board {BoardId} without membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        _logger.LogInformation("User {UserId} retrieved board {BoardId}", userId, request.Id);

        var boardDto = board.Adapt<BoardDto>();
        return Result<BoardDto>.Success(boardDto);
    }
}
