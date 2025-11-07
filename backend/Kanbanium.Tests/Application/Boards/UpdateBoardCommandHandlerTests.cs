using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Boards.Commands.UpdateBoard;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Boards;

public class UpdateBoardCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_UpdateBoard_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard("Original Name");
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var member = TestDataFactory.CreateBoardMember(board.Id, userId, BoardRole.Admin);
        Context.BoardMembers.Add(member);
        await Context.SaveChangesAsync();

        var command = new UpdateBoardCommand
        {
            Id = board.Id,
            Name = "Updated Name",
            Description = "Updated Description",
            BackgroundColor = "#FF5733"
        };

        var handler = new UpdateBoardCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<UpdateBoardCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedBoard = await Context.Boards.FindAsync(board.Id);
        updatedBoard!.Name.Should().Be("Updated Name");
        updatedBoard.Description.Should().Be("Updated Description");
        updatedBoard.BackgroundColor.Should().Be("#FF5733");
    }

    [Fact]
    public async Task Validator_Should_RequireName()
    {
        // Arrange
        var command = new UpdateBoardCommand
        {
            Id = Guid.NewGuid(),
            Name = string.Empty
        };

        var validator = new UpdateBoardCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }
}
