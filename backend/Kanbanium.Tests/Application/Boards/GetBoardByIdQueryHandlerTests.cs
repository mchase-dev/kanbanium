using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Boards.Queries.GetBoardById;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Boards;

public class GetBoardByIdQueryHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ReturnBoard_WhenUserIsMember()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard("Test Board");
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        Context.BoardMembers.Add(member);
        await Context.SaveChangesAsync();

        var query = new GetBoardByIdQuery { Id = board.Id };
        var handler = new GetBoardByIdQueryHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<GetBoardByIdQueryHandler>());

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be("Test Board");
    }

    [Fact]
    public async Task Handle_Should_ThrowNotFoundException_WhenBoardNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var query = new GetBoardByIdQuery { Id = Guid.NewGuid() };
        var handler = new GetBoardByIdQueryHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<GetBoardByIdQueryHandler>());

        // Act & Assert
        await FluentActions.Invoking(async () => await handler.Handle(query, CancellationToken.None))
            .Should().ThrowAsync<Kanbanium.Domain.Common.Exceptions.NotFoundException>();
    }
}
