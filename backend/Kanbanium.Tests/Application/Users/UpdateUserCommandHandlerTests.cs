using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Users.Commands.UpdateUser;
using Kanbanium.Tests.Common;
using Microsoft.AspNetCore.Identity;
using Moq;
using Xunit;

namespace Kanbanium.Tests.Application.Users;

public class UpdateUserCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_UpdateUser_Successfully()
    {
        // Arrange
        var superuserId = Guid.NewGuid().ToString();
        var targetUserId = Guid.NewGuid().ToString();
        SetCurrentUser(superuserId);

        var superuser = TestDataFactory.CreateUser(superuserId);
        var targetUser = TestDataFactory.CreateUser(targetUserId);

        // Mock UserManager calls
        MockUserManager.Setup(x => x.FindByIdAsync(superuserId))
            .Returns(Task.FromResult<ApplicationUser?>(superuser));

        MockUserManager.Setup(x => x.GetRolesAsync(superuser))
            .ReturnsAsync(new List<string> { "Superuser" });

        MockUserManager.Setup(x => x.FindByIdAsync(targetUserId))
            .Returns(Task.FromResult<ApplicationUser?>(targetUser));

        MockUserManager.Setup(x => x.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);

        MockUserManager.Setup(x => x.GetRolesAsync(targetUser))
            .ReturnsAsync(new List<string> { "User" });

        var command = new UpdateUserCommand(
            UserId: targetUserId,
            FirstName: "Updated",
            LastName: "Name",
            Email: null,
            Role: null
        );

        var handler = new UpdateUserCommandHandler(
            MockUserManager.Object,
            MockCurrentUserService.Object,
            TestHelpers.CreateLogger<UpdateUserCommandHandler>()
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.FirstName.Should().Be("Updated");
        result.Data.LastName.Should().Be("Name");

        // Verify UserManager was called
        MockUserManager.Verify(x => x.UpdateAsync(It.IsAny<ApplicationUser>()), Times.Once);
    }
}
