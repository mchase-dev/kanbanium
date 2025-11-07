using FluentAssertions;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Infrastructure;

public class DbContextAuditTests : BaseDbTest
{
    [Fact]
    public async Task SaveChangesAsync_Should_SetCreatedByAndCreatedAt_ForNewEntities()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var board = TestDataFactory.CreateBoard("Test Board");

        // Act
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        // Assert
        board.CreatedBy.Should().Be(userId);
        board.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        board.UpdatedBy.Should().BeNull();
        board.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public async Task SaveChangesAsync_Should_SetUpdatedByAndUpdatedAt_ForModifiedEntities()
    {
        // Arrange
        var userId1 = Guid.NewGuid().ToString();
        var userId2 = Guid.NewGuid().ToString();

        SetCurrentUser(userId1);
        var board = TestDataFactory.CreateBoard("Test Board");
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        // Act - Modify by different user
        SetCurrentUser(userId2);
        board.Name = "Updated Board";
        await Context.SaveChangesAsync();

        // Assert
        board.CreatedBy.Should().Be(userId1);
        board.UpdatedBy.Should().Be(userId2);
        board.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        board.UpdatedAt.Should().BeAfter(board.CreatedAt);
    }

    [Fact]
    public async Task SaveChangesAsync_Should_NotModifyCreatedFields_WhenUpdating()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var board = TestDataFactory.CreateBoard("Test Board");
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var originalCreatedAt = board.CreatedAt;
        var originalCreatedBy = board.CreatedBy;

        await Task.Delay(100); // Small delay to ensure time difference

        // Act
        board.Description = "Updated Description";
        await Context.SaveChangesAsync();

        // Assert
        board.CreatedBy.Should().Be(originalCreatedBy);
        board.CreatedAt.Should().Be(originalCreatedAt);
    }
}
