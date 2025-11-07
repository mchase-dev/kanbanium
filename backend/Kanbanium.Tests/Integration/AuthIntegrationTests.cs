using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace Kanbanium.Tests.Integration;

public class AuthIntegrationTests : IntegrationTestBase
{
    public AuthIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsSuccessAndToken()
    {
        // Arrange
        var request = new
        {
            UserName = "newuser",
            Email = "newuser@example.com",
            Password = "Test123!",
            FirstName = "New",
            LastName = "User"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<AuthResponse>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.AccessToken.Should().NotBeNullOrEmpty();
        result.Data.RefreshToken.Should().NotBeNullOrEmpty();
        result.Data.User.Should().NotBeNull();
        result.Data.User.Email.Should().Be(request.Email);
        result.Data.User.FirstName.Should().Be(request.FirstName);
        result.Data.User.LastName.Should().Be(request.LastName);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsBadRequest()
    {
        // Arrange
        var email = "existing@example.com";
        await CreateTestUserAsync(email);

        var request = new
        {
            UserName = "existing",
            Email = email,
            Password = "Test123!",
            FirstName = "Test",
            LastName = "User"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Register_WithInvalidPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            UserName = "test",
            Email = "test@example.com",
            Password = "weak", // Too weak
            FirstName = "Test",
            LastName = "User"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsSuccessAndToken()
    {
        // Arrange
        var email = "logintest@example.com";
        var password = "Test123!";
        await CreateTestUserAsync(email, password);

        var request = new
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<AuthResponse>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.AccessToken.Should().NotBeNullOrEmpty();
        result.Data.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var request = new
        {
            Email = "nonexistent@example.com",
            Password = "WrongPassword123!"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetCurrentUser_WithValidToken_ReturnsUser()
    {
        // Arrange
        var email = "currentuser@example.com";
        var token = await GetAuthTokenAsync(email);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync("/api/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<UserDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Email.Should().Be(email);
    }

    [Fact]
    public async Task GetCurrentUser_WithoutToken_ReturnsUnauthorized()
    {
        // Act
        var response = await Client.GetAsync("/api/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RefreshToken_WithValidRefreshToken_ReturnsNewTokens()
    {
        // Arrange
        var email = "refreshtest@example.com";
        var registerRequest = new
        {
            UserName = "refreshtest",
            Email = email,
            Password = "Test123!",
            FirstName = "Refresh",
            LastName = "Test"
        };

        var registerResponse = await Client.PostAsJsonAsync("/api/auth/register", registerRequest);
        var registerResult = await registerResponse.Content.ReadFromJsonAsync<ResultWrapper<AuthResponse>>(JsonOptions);

        var refreshRequest = new
        {
            RefreshToken = registerResult!.Data!.RefreshToken
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/refresh-token", refreshRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<AuthResponse>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.AccessToken.Should().NotBeNullOrEmpty();
        result.Data.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task RefreshToken_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var request = new
        {
            RefreshToken = "invalid-refresh-token"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/refresh-token", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    private class ResultWrapper<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string[] Errors { get; set; } = Array.Empty<string>();
    }

    private class AuthResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    private class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
}
