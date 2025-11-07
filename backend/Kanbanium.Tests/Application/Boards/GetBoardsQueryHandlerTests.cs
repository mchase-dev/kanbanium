using FluentAssertions;
using Kanbanium.Domain.Boards.Queries.GetBoards;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Boards;

public class GetBoardsQueryHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ReturnUserBoards()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);
        MockCurrentUserService.Setup(x => x.IsAuthenticated).Returns(true);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board1 = TestDataFactory.CreateBoard("Board 1");
        var board2 = TestDataFactory.CreateBoard("Board 2");
        Context.Boards.Add(board1);
        Context.Boards.Add(board2);
        await Context.SaveChangesAsync();

        var member1 = TestDataFactory.CreateBoardMember(board1.Id, userId);
        var member2 = TestDataFactory.CreateBoardMember(board2.Id, userId);
        Context.BoardMembers.Add(member1);
        Context.BoardMembers.Add(member2);
        await Context.SaveChangesAsync();

        var query = new GetBoardsQuery();
        var handler = new GetBoardsQueryHandler(Context, MockCurrentUserService.Object);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(2);
        result.Data.Should().Contain(b => b.Name == "Board 1");
        result.Data.Should().Contain(b => b.Name == "Board 2");
    }
}
