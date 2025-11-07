using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Boards.Commands.DeleteBoard;

public class DeleteBoardCommandHandler : IRequestHandler<DeleteBoardCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeleteBoardCommandHandler> _logger;

    public DeleteBoardCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DeleteBoardCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteBoardCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var board = await _context.Boards
            .Include(b => b.Members)
            .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);

        if (board == null)
        {
            throw new NotFoundException(nameof(Board), request.Id);
        }

        // Only board admins can delete the board
        var member = board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null || member.Role != BoardRole.Admin)
        {
            _logger.LogWarning("User {UserId} attempted to delete board {BoardId} without admin rights", userId, request.Id);
            throw new ForbiddenException("Only board admins can delete the board");
        }

        // Soft delete (DeletedAt will be set automatically by SaveChangesAsync)
        _context.Boards.Remove(board);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} deleted board {BoardId}", userId, request.Id);

        return Result.Success();
    }
}
