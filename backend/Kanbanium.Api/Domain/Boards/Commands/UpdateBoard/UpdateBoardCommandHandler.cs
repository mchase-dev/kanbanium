using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Boards.Commands.UpdateBoard;

public class UpdateBoardCommandHandler : IRequestHandler<UpdateBoardCommand, Result<BoardDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateBoardCommandHandler> _logger;

    public UpdateBoardCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateBoardCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<BoardDto>> Handle(UpdateBoardCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var board = await _context.Boards
            .Include(b => b.Members)
            .Include(b => b.Columns.OrderBy(c => c.Position))
                .ThenInclude(c => c.Status)
            .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);

        if (board == null)
        {
            throw new NotFoundException(nameof(Board), request.Id);
        }

        // Verify user is an admin of the board
        var member = board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            _logger.LogWarning("User {UserId} attempted to update board {BoardId} without membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role != BoardRole.Admin)
        {
            _logger.LogWarning("User {UserId} attempted to update board {BoardId} without admin rights", userId, request.Id);
            throw new ForbiddenException("Only board admins can update board settings");
        }

        // Update board properties
        board.Name = request.Name;
        board.Description = request.Description;
        board.BackgroundColor = request.BackgroundColor;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated board {BoardId}", userId, request.Id);

        // Reload members for DTO mapping
        var members = await _context.BoardMembers
            .Include(m => m.User)
            .Where(m => m.BoardId == board.Id)
            .ToListAsync(cancellationToken);

        board.Members = members;

        var boardDto = board.Adapt<BoardDto>();
        return Result<BoardDto>.Success(boardDto);
    }
}
