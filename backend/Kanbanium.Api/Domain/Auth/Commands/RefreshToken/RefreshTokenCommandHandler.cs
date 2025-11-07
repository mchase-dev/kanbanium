using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.Domain.Auth.Commands.Login;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Kanbanium.Domain.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, LoginResponse>
{
    private readonly ITokenService _tokenService;
    private readonly ILogger<RefreshTokenCommandHandler> _logger;

    public RefreshTokenCommandHandler(
        ITokenService tokenService,
        ILogger<RefreshTokenCommandHandler> logger)
    {
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<LoginResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var refreshToken = await _tokenService.GetRefreshTokenAsync(request.RefreshToken);

        if (refreshToken == null)
        {
            _logger.LogWarning("Refresh token not found or expired");
            return new LoginResponse
            {
                IsSuccess = false,
                Errors = new[] { "Invalid or expired refresh token" }
            };
        }

        // Revoke the old refresh token
        await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken);

        // Generate new tokens
        var accessToken = await _tokenService.GenerateAccessTokenAsync(refreshToken.User);
        var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(refreshToken.UserId);

        _logger.LogInformation("Tokens refreshed for user {UserId}", refreshToken.UserId);

        return new LoginResponse
        {
            IsSuccess = true,
            AccessToken = accessToken,
            RefreshToken = newRefreshToken.Token,
            User = new DTOs.UserDto
            {
                Id = refreshToken.User.Id,
                UserName = refreshToken.User.UserName!,
                Email = refreshToken.User.Email!,
                FirstName = refreshToken.User.FirstName,
                LastName = refreshToken.User.LastName,
                AvatarUrl = refreshToken.User.AvatarUrl
            }
        };
    }
}
