using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Users.Queries.SearchUsers;
using Kanbanium.Tests.Common;
using Moq;
using Xunit;

namespace Kanbanium.Tests.Application.Users;

public class SearchUsersQueryHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_SearchUsers_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        // Add test users to the actual database context
        var user1 = TestDataFactory.CreateUser(Guid.NewGuid().ToString(), "john@test.com", "johndoe");
        var user2 = TestDataFactory.CreateUser(Guid.NewGuid().ToString(), "jane@test.com", "janedoe");
        var user3 = TestDataFactory.CreateUser(Guid.NewGuid().ToString(), "bob@test.com", "bobsmith");

        Context.Users.AddRange(user1, user2, user3);
        await Context.SaveChangesAsync();

        // Mock UserManager.Users to return the DbSet from Context
        MockUserManager.Setup(x => x.Users).Returns(Context.Users);

        var query = new SearchUsersQuery("john");
        var handler = new SearchUsersQueryHandler(
            MockUserManager.Object,
            MockCurrentUserService.Object,
            TestHelpers.CreateLogger<SearchUsersQueryHandler>()
        );

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(1); // Should find only "john"
        result.Data![0].UserName.Should().Be("johndoe");
    }
}
