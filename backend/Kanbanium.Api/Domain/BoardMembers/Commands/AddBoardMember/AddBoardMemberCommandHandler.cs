using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.BoardMembers.Commands.AddBoardMember;

public class AddBoardMemberCommandHandler : IRequestHandler<AddBoardMemberCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<AddBoardMemberCommandHandler> _logger;

    public AddBoardMemberCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        UserManager<ApplicationUser> userManager,
        ILogger<AddBoardMemberCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result> Handle(AddBoardMemberCommand request, CancellationToken cancellationToken)
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

        // Verify current user is an admin
        var currentMember = board.Members.FirstOrDefault(m => m.UserId == userId);
        if (currentMember == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        if (currentMember.Role != BoardRole.Admin)
        {
            _logger.LogWarning("User {UserId} attempted to add member to board {BoardId} without admin rights", userId, request.BoardId);
            throw new ForbiddenException("Only board admins can add members");
        }

        // Verify user to add exists - try by ID, then username, then email
        var userToAdd = await _userManager.FindByIdAsync(request.UserId);
        if (userToAdd == null)
        {
            userToAdd = await _userManager.FindByNameAsync(request.UserId);
        }
        if (userToAdd == null)
        {
            userToAdd = await _userManager.FindByEmailAsync(request.UserId);
        }
        if (userToAdd == null)
        {
            throw new NotFoundException("User", request.UserId);
        }

        // Use the actual user ID from the found user
        var actualUserId = userToAdd.Id;

        // Check if user is already a member
        var existingMember = board.Members.FirstOrDefault(m => m.UserId == actualUserId);
        if (existingMember != null)
        {
            throw new ConflictException("User is already a member of this board");
        }

        var boardMember = new BoardMember
        {
            BoardId = request.BoardId,
            UserId = actualUserId,
            Role = request.Role
        };

        _context.BoardMembers.Add(boardMember);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} added user {NewUserId} to board {BoardId} with role {Role}",
            userId, actualUserId, request.BoardId, request.Role);

        return Result.Success();
    }
}
