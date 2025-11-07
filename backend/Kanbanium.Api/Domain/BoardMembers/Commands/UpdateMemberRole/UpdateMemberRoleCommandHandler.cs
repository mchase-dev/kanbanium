using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.BoardMembers.Commands.UpdateMemberRole;

public class UpdateMemberRoleCommandHandler : IRequestHandler<UpdateMemberRoleCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateMemberRoleCommandHandler> _logger;

    public UpdateMemberRoleCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateMemberRoleCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateMemberRoleCommand request, CancellationToken cancellationToken)
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

        var memberToUpdate = board.Members.FirstOrDefault(m => m.UserId == request.UserId);
        if (memberToUpdate == null)
        {
            throw new NotFoundException("Board member", request.UserId);
        }

        // Only admins can update roles
        if (currentMember.Role != BoardRole.Admin)
        {
            _logger.LogWarning("User {UserId} attempted to update member role on board {BoardId} without admin rights", userId, request.BoardId);
            throw new ForbiddenException("Only board admins can update member roles");
        }

        // Prevent demoting the last admin
        if (memberToUpdate.Role == BoardRole.Admin && request.Role != BoardRole.Admin)
        {
            var adminCount = board.Members.Count(m => m.Role == BoardRole.Admin);
            if (adminCount == 1)
            {
                throw new BadRequestException("Cannot demote the last admin of the board");
            }
        }

        memberToUpdate.Role = request.Role;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated user {TargetUserId} role to {Role} on board {BoardId}",
            userId, request.UserId, request.Role, request.BoardId);

        return Result.Success();
    }
}
