using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.BoardMembers.Commands.RemoveBoardMember;

public class RemoveBoardMemberCommandHandler : IRequestHandler<RemoveBoardMemberCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<RemoveBoardMemberCommandHandler> _logger;

    public RemoveBoardMemberCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<RemoveBoardMemberCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(RemoveBoardMemberCommand request, CancellationToken cancellationToken)
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

        var currentMember = board.Members.FirstOrDefault(m => m.UserId == userId);
        if (currentMember == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        var memberToRemove = board.Members.FirstOrDefault(m => m.UserId == request.UserId);
        if (memberToRemove == null)
        {
            throw new NotFoundException("Board member", request.UserId);
        }

        // Users can remove themselves
        if (userId == request.UserId)
        {
            // Prevent last admin from leaving
            if (memberToRemove.Role == BoardRole.Admin)
            {
                var adminCount = board.Members.Count(m => m.Role == BoardRole.Admin);
                if (adminCount == 1)
                {
                    throw new BadRequestException("Cannot remove the last admin of the board");
                }
            }

            _context.BoardMembers.Remove(memberToRemove);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("User {UserId} left board {BoardId}", userId, request.BoardId);
            return Result.Success();
        }

        // Only admins can remove other members
        if (currentMember.Role != BoardRole.Admin)
        {
            _logger.LogWarning("User {UserId} attempted to remove member from board {BoardId} without admin rights", userId, request.BoardId);
            throw new ForbiddenException("Only board admins can remove members");
        }

        // Prevent removing the last admin
        if (memberToRemove.Role == BoardRole.Admin)
        {
            var adminCount = board.Members.Count(m => m.Role == BoardRole.Admin);
            if (adminCount == 1)
            {
                throw new BadRequestException("Cannot remove the last admin of the board");
            }
        }

        _context.BoardMembers.Remove(memberToRemove);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} removed user {RemovedUserId} from board {BoardId}",
            userId, request.UserId, request.BoardId);

        return Result.Success();
    }
}
