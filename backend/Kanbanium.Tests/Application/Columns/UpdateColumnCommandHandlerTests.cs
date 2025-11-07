using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Columns.Commands.UpdateColumn;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Columns;

public class UpdateColumnCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_UpdateColumn_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);

        var status = TestDataFactory.CreateStatus();
        var newStatus = TestDataFactory.CreateStatus();
        Context.Statuses.Add(status);
        Context.Statuses.Add(newStatus);
        await Context.SaveChangesAsync();

        var adminMember = TestDataFactory.CreateBoardMember(board.Id, userId, BoardRole.Admin);
        Context.BoardMembers.Add(adminMember);

        var column = TestDataFactory.CreateColumn(board.Id, "Original Column", 0, null, status.Id);
        Context.BoardColumns.Add(column);
        await Context.SaveChangesAsync();

        var command = new UpdateColumnCommand
        {
            Id = column.Id,
            Name = "Updated Column",
            StatusId = newStatus.Id,
            WipLimit = 10
        };

        var handler = new UpdateColumnCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<UpdateColumnCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedColumn = await Context.BoardColumns.FindAsync(column.Id);
        updatedColumn.Should().NotBeNull();
        updatedColumn!.Name.Should().Be("Updated Column");
        updatedColumn.StatusId.Should().Be(newStatus.Id);
        updatedColumn.WipLimit.Should().Be(10);
    }

    [Fact]
    public async Task Validator_Should_RequireName()
    {
        // Arrange
        var command = new UpdateColumnCommand
        {
            Id = Guid.NewGuid(),
            Name = string.Empty
        };

        var validator = new UpdateColumnCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }
}
