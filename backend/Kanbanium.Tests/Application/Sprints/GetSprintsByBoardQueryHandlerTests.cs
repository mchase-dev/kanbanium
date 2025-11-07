using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Sprints.Queries.GetSprintsByBoard;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Sprints;

public class GetSprintsByBoardQueryHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ReturnSprintsList()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var member = TestDataFactory.CreateBoardMember(board.Id, userId, BoardRole.Member);
        Context.BoardMembers.Add(member);

        var sprint1 = TestDataFactory.CreateSprint(board.Id, "Sprint 1", null, null, SprintStatus.Planned);
        var sprint2 = TestDataFactory.CreateSprint(board.Id, "Sprint 2", null, null, SprintStatus.Active);
        Context.Sprints.AddRange(sprint1, sprint2);
        await Context.SaveChangesAsync();

        var query = new GetSprintsByBoardQuery { BoardId = board.Id };
        var handler = new GetSprintsByBoardQueryHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<GetSprintsByBoardQueryHandler>());

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(2);
    }
}
