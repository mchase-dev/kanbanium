using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Kanbanium.Domain.Users.Commands.DisableUser;

public class DisableUserCommandHandler : IRequestHandler<DisableUserCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DisableUserCommandHandler> _logger;

    public DisableUserCommandHandler(
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService,
        ILogger<DisableUserCommandHandler> logger)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(DisableUserCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(currentUserId))
        {
            throw new UnauthorizedException();
        }

        // Verify current user is a Superuser
        var currentUser = await _userManager.FindByIdAsync(currentUserId);
        if (currentUser == null)
        {
            throw new UnauthorizedException();
        }

        var roles = await _userManager.GetRolesAsync(currentUser);
        if (!roles.Contains("Superuser"))
        {
            _logger.LogWarning("User {UserId} attempted to disable user without Superuser role", currentUserId);
            throw new ForbiddenException("Only superusers can disable users");
        }

        // Prevent disabling yourself
        if (request.UserId == currentUserId)
        {
            throw new BadRequestException("You cannot disable your own account");
        }

        // Find user to disable
        var userToDisable = await _userManager.FindByIdAsync(request.UserId);
        if (userToDisable == null)
        {
            throw new NotFoundException("User", request.UserId);
        }

        if (userToDisable.DeletedAt.HasValue)
        {
            throw new BadRequestException("User is already disabled");
        }

        // Soft delete by setting DeletedAt
        userToDisable.DeletedAt = DateTime.UtcNow;
        userToDisable.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(userToDisable);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to disable user: {errors}");
        }

        _logger.LogInformation("Superuser {SuperuserId} disabled user {UserId}", currentUserId, request.UserId);

        return Result.Success();
    }
}
