using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Kanbanium.Domain.Auth.Commands.UpdateProfile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result<UserDto>>
{
    private readonly UserManager<Data.Entities.ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateProfileCommandHandler> _logger;

    public UpdateProfileCommandHandler(
        UserManager<Data.Entities.ApplicationUser> userManager,
        ICurrentUserService currentUserService,
        ILogger<UpdateProfileCommandHandler> logger)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<UserDto>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateProfile");
            return Result<UserDto>.Failure("Unauthorized");
        }

        _logger.LogInformation("User {UserId} updating profile", userId);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found", userId);
            throw new NotFoundException(nameof(Data.Entities.ApplicationUser), userId);
        }

        // Check if email is changing and if it's already in use
        if (user.Email != request.Email)
        {
            var existingUser = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

            if (existingUser != null)
            {
                _logger.LogWarning("Email {Email} is already in use", request.Email);
                return Result<UserDto>.Failure("Email is already in use");
            }
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.UserName = request.Email; // Keep username in sync with email

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogError("Failed to update profile for user {UserId}: {Errors}", userId, errors);
            return Result<UserDto>.Failure(errors);
        }

        _logger.LogInformation("Successfully updated profile for user {UserId}", userId);

        var userDto = new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = user.AvatarUrl,
            Role = (await _userManager.GetRolesAsync(user)).FirstOrDefault(),
            IsDeleted = user.DeletedAt.HasValue,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt
        };

        return Result<UserDto>.Success(userDto);
    }
}
