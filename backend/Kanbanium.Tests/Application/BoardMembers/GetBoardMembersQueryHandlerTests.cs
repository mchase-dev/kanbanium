using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.BoardMembers.Queries.GetBoardMembers;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.BoardMembers;

public class GetBoardMembersQueryHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ReturnBoardMembers()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var otherUserId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        var otherUser = TestDataFactory.CreateUser(otherUserId);
        Context.Users.Add(user);
        Context.Users.Add(otherUser);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var member1 = TestDataFactory.CreateBoardMember(board.Id, userId, BoardRole.Admin);
        var member2 = TestDataFactory.CreateBoardMember(board.Id, otherUserId, BoardRole.Member);
        Context.BoardMembers.Add(member1);
        Context.BoardMembers.Add(member2);
        await Context.SaveChangesAsync();

        var query = new GetBoardMembersQuery { BoardId = board.Id };
        var handler = new GetBoardMembersQueryHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<GetBoardMembersQueryHandler>());

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(2);
    }
}
