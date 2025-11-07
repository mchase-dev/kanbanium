using FluentAssertions;
using Kanbanium.Data.Entities;
using Xunit;

namespace Kanbanium.Tests.Domain;

public class TaskItemTests
{
    [Fact]
    public void TaskItem_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var task = new TaskItem();

        // Assert
        task.Priority.Should().Be(Priority.Low);
        task.PositionIndex.Should().Be(0);
        task.IsArchived.Should().BeFalse();
        task.Labels.Should().BeEmpty();
        task.SubTasks.Should().BeEmpty();
        task.Comments.Should().BeEmpty();
        task.Watchers.Should().BeEmpty();
        task.History.Should().BeEmpty();
    }

    [Theory]
    [InlineData(Priority.Low)]
    [InlineData(Priority.Medium)]
    [InlineData(Priority.High)]
    [InlineData(Priority.Critical)]
    public void TaskItem_ShouldAcceptValidPriorities(Priority priority)
    {
        // Arrange & Act
        var task = new TaskItem { Priority = priority };

        // Assert
        task.Priority.Should().Be(priority);
    }

    [Fact]
    public void TaskItem_ShouldHaveRequiredProperties()
    {
        // Arrange
        var taskId = Guid.NewGuid();
        var title = "Test Task";
        var boardId = Guid.NewGuid();
        var columnId = Guid.NewGuid();
        var statusId = Guid.NewGuid();
        var typeId = Guid.NewGuid();

        // Act
        var task = new TaskItem
        {
            Id = taskId,
            Title = title,
            BoardId = boardId,
            ColumnId = columnId,
            StatusId = statusId,
            TypeId = typeId
        };

        // Assert
        task.Id.Should().Be(taskId);
        task.Title.Should().Be(title);
        task.BoardId.Should().Be(boardId);
        task.ColumnId.Should().Be(columnId);
        task.StatusId.Should().Be(statusId);
        task.TypeId.Should().Be(typeId);
    }

    [Fact]
    public void TaskItem_ShouldAcceptOptionalProperties()
    {
        // Arrange
        var description = "Test description";
        var assigneeId = "user-123";
        var sprintId = Guid.NewGuid();
        var dueDate = DateTime.UtcNow.AddDays(7);
        var positionIndex = 5;

        // Act
        var task = new TaskItem
        {
            Description = description,
            AssigneeId = assigneeId,
            SprintId = sprintId,
            DueDate = dueDate,
            PositionIndex = positionIndex
        };

        // Assert
        task.Description.Should().Be(description);
        task.AssigneeId.Should().Be(assigneeId);
        task.SprintId.Should().Be(sprintId);
        task.DueDate.Should().Be(dueDate);
        task.PositionIndex.Should().Be(positionIndex);
    }

    [Fact]
    public void TaskItem_ShouldSupportArchiving()
    {
        // Arrange
        var task = new TaskItem { IsArchived = false };

        // Act
        task.IsArchived = true;

        // Assert
        task.IsArchived.Should().BeTrue();
    }

    [Fact]
    public void TaskItem_ShouldHaveNavigationProperties()
    {
        // Arrange & Act
        var task = new TaskItem();

        // Assert - Navigation properties should be initialized
        task.Labels.Should().NotBeNull();
        task.SubTasks.Should().NotBeNull();
        task.Comments.Should().NotBeNull();
        task.Attachments.Should().NotBeNull();
        task.Watchers.Should().NotBeNull();
        task.History.Should().NotBeNull();
    }

    [Fact]
    public void TaskItem_ShouldSupportPositionIndex()
    {
        // Arrange & Act
        var task = new TaskItem { PositionIndex = 10 };

        // Assert
        task.PositionIndex.Should().Be(10);
    }
}
