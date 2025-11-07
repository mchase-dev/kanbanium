using Kanbanium.Domain.Auth.Commands.Login;
using Kanbanium.Domain.Auth.Commands.RefreshToken;
using Kanbanium.Domain.Auth.Commands.Register;
using Kanbanium.Domain.Auth.Commands.UpdateProfile;
using Kanbanium.Domain.Auth.Queries.GetCurrentUser;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Kanbanium.Controllers;

/// <summary>
/// Handles user authentication and profile management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="command">Registration details including username, email, password, and name</param>
    /// <returns>Authentication response with access token, refresh token, and user details</returns>
    /// <response code="200">Registration successful</response>
    /// <response code="400">Invalid input or registration failed</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/register
    ///     {
    ///        "userName": "johndoe",
    ///        "email": "john@example.com",
    ///        "password": "SecurePass123!",
    ///        "firstName": "John",
    ///        "lastName": "Doe"
    ///     }
    ///
    /// </remarks>
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        var authResponse = new AuthResponse
        {
            AccessToken = result.AccessToken!,
            RefreshToken = result.RefreshToken!,
            User = result.User!
        };

        return Ok(Result<AuthResponse>.Success(authResponse));
    }

    /// <summary>
    /// Authenticate a user and get access token
    /// </summary>
    /// <param name="command">Login credentials (email/username and password)</param>
    /// <returns>Authentication response with access token, refresh token, and user details</returns>
    /// <response code="200">Login successful</response>
    /// <response code="400">Invalid credentials</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/login
    ///     {
    ///        "email": "john@example.com",
    ///        "password": "SecurePass123!"
    ///     }
    ///
    /// </remarks>
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        var authResponse = new AuthResponse
        {
            AccessToken = result.AccessToken!,
            RefreshToken = result.RefreshToken!,
            User = result.User!
        };

        return Ok(Result<AuthResponse>.Success(authResponse));
    }

    /// <summary>
    /// Refresh an expired access token using a refresh token
    /// </summary>
    /// <param name="command">Contains the refresh token</param>
    /// <returns>New access token and refresh token</returns>
    /// <response code="200">Token refreshed successfully</response>
    /// <response code="400">Invalid or expired refresh token</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/refresh-token
    ///     {
    ///        "refreshToken": "your-refresh-token-here"
    ///     }
    ///
    /// </remarks>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        var authResponse = new AuthResponse
        {
            AccessToken = result.AccessToken!,
            RefreshToken = result.RefreshToken!,
            User = result.User!
        };

        return Ok(Result<AuthResponse>.Success(authResponse));
    }

    /// <summary>
    /// Get the currently authenticated user's profile information
    /// </summary>
    /// <returns>Current user details</returns>
    /// <response code="200">User profile retrieved successfully</response>
    /// <response code="401">Not authenticated</response>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var result = await _mediator.Send(new GetCurrentUserQuery());

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return Ok(result);
    }

    /// <summary>
    /// Update the current user's profile information
    /// </summary>
    /// <param name="command">Updated profile details (first name, last name, email)</param>
    /// <returns>Updated user profile</returns>
    /// <response code="200">Profile updated successfully</response>
    /// <response code="400">Invalid input</response>
    /// <response code="401">Not authenticated</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     PUT /api/auth/profile
    ///     {
    ///        "firstName": "John",
    ///        "lastName": "Doe",
    ///        "email": "newemail@example.com"
    ///     }
    ///
    /// </remarks>
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return Ok(result);
    }
}
