using FluentAssertions;
using Kanbanium.Domain.Auth.Commands.Register;
using Xunit;

namespace Kanbanium.Tests.Application.Auth;

public class RegisterCommandHandlerTests
{
    [Fact]
    public async Task Validator_Should_RequireFirstName()
    {
        // Arrange
        var command = new RegisterCommand
        {
            FirstName = string.Empty,
            LastName = "Doe",
            Email = "john@example.com",
            Password = "ValidPassword123!",
            UserName = "johndoe"
        };

        var validator = new RegisterCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FirstName");
    }

    [Fact]
    public async Task Validator_Should_RequireLastName()
    {
        // Arrange
        var command = new RegisterCommand
        {
            FirstName = "John",
            LastName = string.Empty,
            Email = "john@example.com",
            Password = "ValidPassword123!",
            UserName = "johndoe"
        };

        var validator = new RegisterCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "LastName");
    }

    [Fact]
    public async Task Validator_Should_RequireValidEmail()
    {
        // Arrange
        var command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "invalid-email",
            Password = "ValidPassword123!",
            UserName = "johndoe"
        };

        var validator = new RegisterCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Fact]
    public async Task Validator_Should_RequirePassword()
    {
        // Arrange
        var command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Password = string.Empty,
            UserName = "johndoe"
        };

        var validator = new RegisterCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password");
    }

    [Fact]
    public async Task Validator_Should_RequireUserName()
    {
        // Arrange
        var command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Password = "ValidPassword123!",
            UserName = string.Empty
        };

        var validator = new RegisterCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "UserName");
    }

    [Fact]
    public async Task Validator_Should_Pass_WhenAllFieldsValid()
    {
        // Arrange
        var command = new RegisterCommand
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Password = "ValidPassword123!",
            UserName = "johndoe"
        };

        var validator = new RegisterCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }
}
