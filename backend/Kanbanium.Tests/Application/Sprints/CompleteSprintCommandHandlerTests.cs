using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Sprints.Commands.CompleteSprint;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Sprints;

public class CompleteSprintCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_CompleteSprint_Successfully()
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

        var sprint = TestDataFactory.CreateSprint(board.Id, "Sprint 1", null, null, SprintStatus.Active);
        Context.Sprints.Add(sprint);
        await Context.SaveChangesAsync();

        var command = new CompleteSprintCommand
        {
            Id = sprint.Id
        };

        var handler = new CompleteSprintCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<CompleteSprintCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Status.Should().Be(SprintStatus.Completed);

        var updatedSprint = await Context.Sprints.FindAsync(sprint.Id);
        updatedSprint.Should().NotBeNull();
        updatedSprint!.Status.Should().Be(SprintStatus.Completed);
    }
}
