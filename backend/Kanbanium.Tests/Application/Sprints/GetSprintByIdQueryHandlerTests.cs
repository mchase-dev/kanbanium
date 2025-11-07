using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Sprints.Queries.GetSprintById;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Sprints;

public class GetSprintByIdQueryHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ReturnSprint_WhenUserIsMember()
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

        var sprint = TestDataFactory.CreateSprint(board.Id, "Sprint 1");
        Context.Sprints.Add(sprint);
        await Context.SaveChangesAsync();

        var query = new GetSprintByIdQuery { Id = sprint.Id };
        var handler = new GetSprintByIdQueryHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<GetSprintByIdQueryHandler>());

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be("Sprint 1");
    }

    [Fact]
    public async Task Handle_Should_ThrowNotFoundException_WhenSprintNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var query = new GetSprintByIdQuery { Id = Guid.NewGuid() };
        var handler = new GetSprintByIdQueryHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<GetSprintByIdQueryHandler>());

        // Act & Assert
        await FluentActions.Invoking(async () => await handler.Handle(query, CancellationToken.None))
            .Should().ThrowAsync<NotFoundException>();
    }
}
