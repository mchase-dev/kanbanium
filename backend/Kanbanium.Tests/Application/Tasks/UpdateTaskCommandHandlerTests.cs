using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Tasks.Commands.UpdateTask;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.Tasks;

public class UpdateTaskCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_UpdateTask_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var column = TestDataFactory.CreateColumn(board.Id, "To Do");
        Context.Columns.Add(column);

        var status = TestDataFactory.CreateStatus();
        Context.Statuses.Add(status);

        var taskType = TestDataFactory.CreateTaskType();
        Context.TaskTypes.Add(taskType);

        await Context.SaveChangesAsync();

        var task = TestDataFactory.CreateTask(board.Id, column.Id, status.Id, taskType.Id, "Original Title");
        Context.Tasks.Add(task);

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        Context.BoardMembers.Add(member);

        await Context.SaveChangesAsync();

        var command = new UpdateTaskCommand
        {
            Id = task.Id,
            Title = "Updated Title",
            Description = "Updated Description",
            Priority = Priority.High,
            StatusId = status.Id,
            TypeId = taskType.Id
        };

        var handler = new UpdateTaskCommandHandler(Context, MockCurrentUserService.Object, MockNotificationService.Object, TestHelpers.CreateLogger<UpdateTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedTask = await Context.Tasks.FindAsync(task.Id);
        updatedTask!.Title.Should().Be("Updated Title");
        updatedTask.Description.Should().Be("Updated Description");
        updatedTask.Priority.Should().Be(Priority.High);
    }

    [Fact]
    public async Task Validator_Should_RequireTitle()
    {
        // Arrange
        var command = new UpdateTaskCommand
        {
            Id = Guid.NewGuid(),
            Title = string.Empty
        };

        var validator = new UpdateTaskCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Title");
    }

    [Fact]
    public async Task Validator_Should_RequireId()
    {
        // Arrange
        var command = new UpdateTaskCommand
        {
            Id = Guid.Empty,
            Title = "Test"
        };

        var validator = new UpdateTaskCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Id");
    }
}
