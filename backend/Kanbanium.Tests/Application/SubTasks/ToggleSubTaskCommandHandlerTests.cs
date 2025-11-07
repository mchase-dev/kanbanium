using FluentAssertions;
using Kanbanium.Domain.SubTasks.Commands.ToggleSubTask;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.SubTasks;

public class ToggleSubTaskCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ToggleSubTask_FromIncompleteToComplete()
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

        var task = TestDataFactory.CreateTask(board.Id, column.Id, status.Id, taskType.Id, "Test Task");
        Context.Tasks.Add(task);

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        Context.BoardMembers.Add(member);

        await Context.SaveChangesAsync();

        var subTask = TestDataFactory.CreateSubTask(task.Id, "Test SubTask", false);
        Context.SubTasks.Add(subTask);
        await Context.SaveChangesAsync();

        var command = new ToggleSubTaskCommand { Id = subTask.Id };
        var handler = new ToggleSubTaskCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<ToggleSubTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedSubTask = await Context.SubTasks.FindAsync(subTask.Id);
        updatedSubTask!.IsCompleted.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_Should_ToggleSubTask_FromCompleteToIncomplete()
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

        var task = TestDataFactory.CreateTask(board.Id, column.Id, status.Id, taskType.Id, "Test Task");
        Context.Tasks.Add(task);

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        Context.BoardMembers.Add(member);

        await Context.SaveChangesAsync();

        var subTask = TestDataFactory.CreateSubTask(task.Id, "Test SubTask", true); // Already completed
        Context.SubTasks.Add(subTask);
        await Context.SaveChangesAsync();

        var command = new ToggleSubTaskCommand { Id = subTask.Id };
        var handler = new ToggleSubTaskCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<ToggleSubTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedSubTask = await Context.SubTasks.FindAsync(subTask.Id);
        updatedSubTask!.IsCompleted.Should().BeFalse();
    }

}
