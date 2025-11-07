using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Kanbanium.Domain.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result<UserDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateUserCommandHandler> _logger;

    public UpdateUserCommandHandler(
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService,
        ILogger<UpdateUserCommandHandler> logger)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<UserDto>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to update user without Superuser role", currentUserId);
            throw new ForbiddenException("Only superusers can update users");
        }

        // Find user to update
        var userToUpdate = await _userManager.FindByIdAsync(request.UserId);
        if (userToUpdate == null)
        {
            throw new NotFoundException("User", request.UserId);
        }

        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(request.FirstName))
        {
            userToUpdate.FirstName = request.FirstName;
        }

        if (!string.IsNullOrWhiteSpace(request.LastName))
        {
            userToUpdate.LastName = request.LastName;
        }

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != userToUpdate.Email)
        {
            // Check if new email is already taken
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != request.UserId)
            {
                throw new ConflictException($"Email '{request.Email}' is already in use");
            }
            userToUpdate.Email = request.Email;
        }

        userToUpdate.UpdatedAt = DateTime.UtcNow;

        var updateResult = await _userManager.UpdateAsync(userToUpdate);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to update user: {errors}");
        }

        // Update role if provided
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var validRoles = new[] { "User", "Manager", "Admin", "Superuser" };
            if (!validRoles.Contains(request.Role))
            {
                throw new BadRequestException($"Invalid role. Must be one of: {string.Join(", ", validRoles)}");
            }

            var currentRoles = await _userManager.GetRolesAsync(userToUpdate);
            await _userManager.RemoveFromRolesAsync(userToUpdate, currentRoles);
            await _userManager.AddToRoleAsync(userToUpdate, request.Role);
        }

        _logger.LogInformation("Superuser {SuperuserId} updated user {UserId}", currentUserId, request.UserId);

        // Get updated role
        var updatedRoles = await _userManager.GetRolesAsync(userToUpdate);

        // Map to DTO
        var userDto = userToUpdate.Adapt<UserDto>();
        userDto.Role = updatedRoles.FirstOrDefault();
        userDto.IsDeleted = userToUpdate.DeletedAt.HasValue;

        return Result<UserDto>.Success(userDto);
    }
}
