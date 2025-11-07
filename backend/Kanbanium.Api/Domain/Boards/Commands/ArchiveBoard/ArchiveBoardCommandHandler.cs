using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Boards.Commands.ArchiveBoard;

public class ArchiveBoardCommandHandler : IRequestHandler<ArchiveBoardCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ArchiveBoardCommandHandler> _logger;

    public ArchiveBoardCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<ArchiveBoardCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(ArchiveBoardCommand request, CancellationToken cancellationToken)
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

        // Verify user is an admin of the board
        var member = board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role != BoardRole.Admin)
        {
            _logger.LogWarning("User {UserId} attempted to archive board {BoardId} without admin rights", userId, request.Id);
            throw new ForbiddenException("Only board admins can archive the board");
        }

        board.IsArchived = true;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} archived board {BoardId}", userId, request.Id);

        return Result.Success();
    }
}
