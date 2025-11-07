using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Sprints.Commands.UpdateSprint;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Sprints;

public class UpdateSprintCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_UpdateSprint_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var adminMember = TestDataFactory.CreateBoardMember(board.Id, userId, BoardRole.Admin);
        Context.BoardMembers.Add(adminMember);

        var sprint = TestDataFactory.CreateSprint(board.Id, "Original Sprint");
        Context.Sprints.Add(sprint);
        await Context.SaveChangesAsync();

        var newStartDate = DateTime.UtcNow.AddDays(2);
        var newEndDate = DateTime.UtcNow.AddDays(16);

        var command = new UpdateSprintCommand
        {
            Id = sprint.Id,
            Name = "Updated Sprint",
            Goal = "New goal",
            StartDate = newStartDate,
            EndDate = newEndDate
        };

        var handler = new UpdateSprintCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<UpdateSprintCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedSprint = await Context.Sprints.FindAsync(sprint.Id);
        updatedSprint.Should().NotBeNull();
        updatedSprint!.Name.Should().Be("Updated Sprint");
        updatedSprint.Goal.Should().Be("New goal");
    }

    [Fact]
    public async Task Validator_Should_RequireName()
    {
        // Arrange
        var command = new UpdateSprintCommand
        {
            Id = Guid.NewGuid(),
            Name = string.Empty,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(14)
        };

        var validator = new UpdateSprintCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }
}
