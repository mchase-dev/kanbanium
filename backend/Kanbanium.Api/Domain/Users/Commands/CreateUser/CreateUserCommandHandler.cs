using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Kanbanium.Domain.Users.Commands.CreateUser;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<UserDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateUserCommandHandler> _logger;

    public CreateUserCommandHandler(
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService,
        ILogger<CreateUserCommandHandler> logger)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<UserDto>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to create user without Superuser role", currentUserId);
            throw new ForbiddenException("Only superusers can create users");
        }

        // Validate role
        var validRoles = new[] { "User", "Manager", "Admin", "Superuser" };
        if (!validRoles.Contains(request.Role))
        {
            throw new BadRequestException($"Invalid role. Must be one of: {string.Join(", ", validRoles)}");
        }

        // Check if username already exists
        var existingUserByUsername = await _userManager.FindByNameAsync(request.UserName);
        if (existingUserByUsername != null)
        {
            throw new ConflictException($"Username '{request.UserName}' is already taken");
        }

        // Check if email already exists
        var existingUserByEmail = await _userManager.FindByEmailAsync(request.Email);
        if (existingUserByEmail != null)
        {
            throw new ConflictException($"Email '{request.Email}' is already registered");
        }

        // Create new user
        var newUser = new ApplicationUser
        {
            UserName = request.UserName,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailConfirmed = true, // Admin-created users are auto-confirmed
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(newUser, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BadRequestException($"Failed to create user: {errors}");
        }

        // Assign role
        await _userManager.AddToRoleAsync(newUser, request.Role);

        _logger.LogInformation("Superuser {SuperuserId} created new user {UserId} with role {Role}",
            currentUserId, newUser.Id, request.Role);

        // Map to DTO
        var userDto = newUser.Adapt<UserDto>();
        userDto.Role = request.Role;
        userDto.IsDeleted = false;

        return Result<UserDto>.Success(userDto);
    }
}
