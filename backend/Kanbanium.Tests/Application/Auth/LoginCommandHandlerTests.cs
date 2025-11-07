using FluentAssertions;
using Kanbanium.Domain.Auth.Commands.Login;
using Xunit;

namespace Kanbanium.Tests.Application.Auth;

public class LoginCommandHandlerTests
{
    [Fact]
    public void LoginCommand_Should_HaveRequiredProperties()
    {
        // Arrange & Act
        var command = new LoginCommand
        {
            Email = "test@example.com",
            Password = "ValidPassword123!"
        };

        // Assert
        command.Email.Should().Be("test@example.com");
        command.Password.Should().Be("ValidPassword123!");
    }

    [Fact]
    public void LoginCommand_Should_InitializeWithEmptyStrings()
    {
        // Arrange & Act
        var command = new LoginCommand();

        // Assert
        command.Email.Should().Be(string.Empty);
        command.Password.Should().Be(string.Empty);
    }

    [Fact]
    public void LoginResponse_Should_InitializeCorrectly()
    {
        // Arrange & Act
        var response = new LoginResponse();

        // Assert
        response.IsSuccess.Should().BeFalse();
        response.AccessToken.Should().BeNull();
        response.RefreshToken.Should().BeNull();
        response.User.Should().BeNull();
        response.Errors.Should().BeEmpty();
    }
}
