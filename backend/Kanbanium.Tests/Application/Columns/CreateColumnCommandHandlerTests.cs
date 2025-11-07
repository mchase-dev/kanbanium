using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Columns.Commands.CreateColumn;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.Columns;

public class CreateColumnCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_CreateColumn_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);

        var status = TestDataFactory.CreateStatus();
        Context.Statuses.Add(status);
        await Context.SaveChangesAsync();

        var adminMember = TestDataFactory.CreateBoardMember(board.Id, userId, BoardRole.Admin);
        Context.BoardMembers.Add(adminMember);
        await Context.SaveChangesAsync();

        var command = new CreateColumnCommand
        {
            BoardId = board.Id,
            Name = "In Progress",
            StatusId = status.Id,
            WipLimit = 5
        };

        var handler = new CreateColumnCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<CreateColumnCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be("In Progress");

        var column = await Context.BoardColumns.FirstOrDefaultAsync(c => c.BoardId == board.Id);
        column.Should().NotBeNull();
        column!.Name.Should().Be("In Progress");
        column.StatusId.Should().Be(status.Id);
        column.WipLimit.Should().Be(5);
        column.Position.Should().Be(0); // First column
    }

    [Fact]
    public async Task Validator_Should_RequireName()
    {
        // Arrange
        var command = new CreateColumnCommand
        {
            BoardId = Guid.NewGuid(),
            Name = string.Empty
        };

        var validator = new CreateColumnCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }
}
