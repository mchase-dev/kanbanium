using FluentAssertions;
using Kanbanium.Domain.Boards.Commands.CreateBoard;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application;

public class CreateBoardCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ReturnError_WhenNameIsEmpty()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = string.Empty,
            Description = "Test Description"
        };

        var validator = new CreateBoardCommandValidator();

        // Act
        var validationResult = await validator.ValidateAsync(command);

        // Assert
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().Contain(e => e.PropertyName == "Name");
    }
}
