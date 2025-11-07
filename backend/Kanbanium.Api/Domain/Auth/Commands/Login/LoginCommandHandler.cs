using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.Data.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Kanbanium.Domain.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        ILogger<LoginCommandHandler> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Try to find user by email first, then by username
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            user = await _userManager.FindByNameAsync(request.Email);
        }

        if (user == null)
        {
            _logger.LogWarning("Login attempt failed: User with email/username {Email} not found", request.Email);
            throw new UnauthorizedException("Invalid email or password");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            _logger.LogWarning("Login attempt failed for user {Email}: {Reason}",
                request.Email, result.IsLockedOut ? "Account locked" : "Invalid password");

            var errorMessage = result.IsLockedOut
                ? "Account is locked out"
                : "Invalid email or password";

            throw new UnauthorizedException(errorMessage);
        }

        // Generate tokens
        var accessToken = await _tokenService.GenerateAccessTokenAsync(user);
        var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user.Id);

        _logger.LogInformation("User {Email} (ID: {UserId}) logged in successfully", request.Email, user.Id);

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Get user role
        var roles = await _userManager.GetRolesAsync(user);

        return new LoginResponse
        {
            IsSuccess = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            User = new DTOs.UserDto
            {
                Id = user.Id,
                UserName = user.UserName!,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                Role = roles.FirstOrDefault(),
                IsDeleted = user.DeletedAt.HasValue,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt
            }
        };
    }
}
