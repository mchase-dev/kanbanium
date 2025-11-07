using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Users.Commands.EnableUser;
using Kanbanium.Tests.Common;
using Microsoft.AspNetCore.Identity;
using Moq;
using Xunit;

namespace Kanbanium.Tests.Application.Users;

public class EnableUserCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_EnableUser_Successfully()
    {
        // Arrange
        var superuserId = Guid.NewGuid().ToString();
        var targetUserId = Guid.NewGuid().ToString();
        SetCurrentUser(superuserId);

        var superuser = TestDataFactory.CreateUser(superuserId);
        var targetUser = TestDataFactory.CreateUser(targetUserId);
        targetUser.DeletedAt = DateTime.UtcNow; // User is disabled

        // Mock UserManager calls
        MockUserManager.Setup(x => x.FindByIdAsync(superuserId))
            .Returns(Task.FromResult<ApplicationUser?>(superuser));

        MockUserManager.Setup(x => x.GetRolesAsync(superuser))
            .ReturnsAsync(new List<string> { "Superuser" });

        MockUserManager.Setup(x => x.FindByIdAsync(targetUserId))
            .Returns(Task.FromResult<ApplicationUser?>(targetUser));

        MockUserManager.Setup(x => x.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);

        var command = new EnableUserCommand(targetUserId);

        var handler = new EnableUserCommandHandler(
            MockUserManager.Object,
            MockCurrentUserService.Object,
            TestHelpers.CreateLogger<EnableUserCommandHandler>()
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify UserManager.UpdateAsync was called with DeletedAt cleared
        MockUserManager.Verify(x => x.UpdateAsync(It.Is<ApplicationUser>(u =>
            u.Id == targetUserId && !u.DeletedAt.HasValue)), Times.Once);
    }
}
