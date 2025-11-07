using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Tasks.Commands.MoveTask;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Kanbanium.Tests.Application;

public class MoveTaskCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_MoveTask_ToNewColumn()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var column1 = TestDataFactory.CreateColumn(board.Id, "To Do", 0);
        var column2 = TestDataFactory.CreateColumn(board.Id, "In Progress", 1);
        Context.Columns.AddRange(column1, column2);

        var status = TestDataFactory.CreateStatus();
        Context.Statuses.Add(status);

        var taskType = TestDataFactory.CreateTaskType();
        Context.TaskTypes.Add(taskType);

        await Context.SaveChangesAsync();

        var task = TestDataFactory.CreateTask(board.Id, column1.Id, status.Id, taskType.Id, "Test Task");
        task.PositionIndex = 0;
        Context.Tasks.Add(task);

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        Context.BoardMembers.Add(member);

        await Context.SaveChangesAsync();

        var command = new MoveTaskCommand
        {
            Id = task.Id,
            ColumnId = column2.Id,
            PositionIndex = 0
        };

        var handler = new MoveTaskCommandHandler(Context, MockCurrentUserService.Object, MockNotificationService.Object, TestHelpers.CreateLogger<MoveTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify task was moved
        var movedTask = await Context.Tasks.FindAsync(task.Id);
        movedTask.Should().NotBeNull();
        movedTask!.ColumnId.Should().Be(column2.Id);
        movedTask.PositionIndex.Should().Be(0);
    }

    [Fact]
    public async Task Handle_Should_UpdatePosition_WhenMovingWithinSameColumn()
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

        var task1 = TestDataFactory.CreateTask(board.Id, column.Id, status.Id, taskType.Id, "Task 1");
        task1.PositionIndex = 0;
        var task2 = TestDataFactory.CreateTask(board.Id, column.Id, status.Id, taskType.Id, "Task 2");
        task2.PositionIndex = 1;
        var task3 = TestDataFactory.CreateTask(board.Id, column.Id, status.Id, taskType.Id, "Task 3");
        task3.PositionIndex = 2;

        Context.Tasks.AddRange(task1, task2, task3);

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        Context.BoardMembers.Add(member);

        await Context.SaveChangesAsync();

        var command = new MoveTaskCommand
        {
            Id = task1.Id,
            ColumnId = column.Id,
            PositionIndex = 2
        };

        var handler = new MoveTaskCommandHandler(Context, MockCurrentUserService.Object, MockNotificationService.Object, TestHelpers.CreateLogger<MoveTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify task was repositioned
        var movedTask = await Context.Tasks.FindAsync(task1.Id);
        movedTask.Should().NotBeNull();
        movedTask!.PositionIndex.Should().Be(2);
    }

    [Fact]
    public async Task Handle_Should_SendNotification_AfterMovingTask()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var column1 = TestDataFactory.CreateColumn(board.Id, "To Do");
        var column2 = TestDataFactory.CreateColumn(board.Id, "Done");
        Context.Columns.AddRange(column1, column2);

        var status = TestDataFactory.CreateStatus();
        Context.Statuses.Add(status);

        var taskType = TestDataFactory.CreateTaskType();
        Context.TaskTypes.Add(taskType);

        await Context.SaveChangesAsync();

        var task = TestDataFactory.CreateTask(board.Id, column1.Id, status.Id, taskType.Id);
        Context.Tasks.Add(task);

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        Context.BoardMembers.Add(member);

        await Context.SaveChangesAsync();

        var command = new MoveTaskCommand
        {
            Id = task.Id,
            ColumnId = column2.Id,
            PositionIndex = 0
        };

        var handler = new MoveTaskCommandHandler(Context, MockCurrentUserService.Object, MockNotificationService.Object, TestHelpers.CreateLogger<MoveTaskCommandHandler>());

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        MockNotificationService.Verify(
            x => x.TaskMoved(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>()),
            Times.Once);
    }
}
