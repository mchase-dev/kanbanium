using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Kanbanium.Domain.Users.Commands.EnableUser;

public class EnableUserCommandHandler : IRequestHandler<EnableUserCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<EnableUserCommandHandler> _logger;

    public EnableUserCommandHandler(
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService,
        ILogger<EnableUserCommandHandler> logger)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(EnableUserCommand request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to enable user without Superuser role", currentUserId);
            throw new ForbiddenException("Only superusers can enable users");
        }

        // Find user to enable
        var userToEnable = await _userManager.FindByIdAsync(request.UserId);
        if (userToEnable == null)
        {
            throw new NotFoundException("User", request.UserId);
        }

        if (!userToEnable.DeletedAt.HasValue)
        {
            throw new BadRequestException("User is already enabled");
        }

        // Re-enable by clearing DeletedAt
        userToEnable.DeletedAt = null;
        userToEnable.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(userToEnable);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to enable user: {errors}");
        }

        _logger.LogInformation("Superuser {SuperuserId} enabled user {UserId}", currentUserId, request.UserId);

        return Result.Success();
    }
}
