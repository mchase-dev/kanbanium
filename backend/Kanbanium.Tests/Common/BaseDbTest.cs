using Microsoft.EntityFrameworkCore;
using Moq;
using Kanbanium.Data;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Kanbanium.Tests.Common;

public abstract class BaseDbTest : IDisposable
{
    protected ApplicationDbContext Context { get; private set; }
    protected Mock<ICurrentUserService> MockCurrentUserService { get; private set; }
    protected Mock<INotificationService> MockNotificationService { get; private set; }
    protected Mock<UserManager<ApplicationUser>> MockUserManager { get; private set; }

    protected BaseDbTest()
    {
        MockCurrentUserService = new Mock<ICurrentUserService>();
        MockNotificationService = new Mock<INotificationService>();

        // Mock UserManager
        var mockUserStore = new Mock<IUserStore<ApplicationUser>>();
        MockUserManager = new Mock<UserManager<ApplicationUser>>(
            mockUserStore.Object, null, null, null, null, null, null, null, null);

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        Context = new ApplicationDbContext(
            options,
            MockCurrentUserService.Object
        );

        // Ensure database is created
        Context.Database.EnsureCreated();
    }

    protected void SetCurrentUser(string userId)
    {
        MockCurrentUserService.Setup(x => x.UserId).Returns(userId);
    }

    public void Dispose()
    {
        Context?.Dispose();
    }
}
