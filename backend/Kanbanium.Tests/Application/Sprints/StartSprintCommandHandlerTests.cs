using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Sprints.Commands.StartSprint;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Sprints;

public class StartSprintCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_StartSprint_Successfully()
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

        var sprint = TestDataFactory.CreateSprint(board.Id, "Sprint 1", null, null, SprintStatus.Planned);
        Context.Sprints.Add(sprint);
        await Context.SaveChangesAsync();

        var command = new StartSprintCommand
        {
            Id = sprint.Id
        };

        var handler = new StartSprintCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<StartSprintCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Status.Should().Be(SprintStatus.Active);

        var updatedSprint = await Context.Sprints.FindAsync(sprint.Id);
        updatedSprint.Should().NotBeNull();
        updatedSprint!.Status.Should().Be(SprintStatus.Active);
    }
}
