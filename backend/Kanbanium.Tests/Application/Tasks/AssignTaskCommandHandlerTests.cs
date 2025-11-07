using FluentAssertions;
using Kanbanium.Domain.Tasks.Commands.AssignTask;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.Tasks;

public class AssignTaskCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_AssignTask_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var assigneeId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        var assignee = TestDataFactory.CreateUser(assigneeId);
        Context.Users.Add(user);
        Context.Users.Add(assignee);

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

        var member1 = TestDataFactory.CreateBoardMember(board.Id, userId);
        var member2 = TestDataFactory.CreateBoardMember(board.Id, assigneeId);
        Context.BoardMembers.Add(member1);
        Context.BoardMembers.Add(member2);

        await Context.SaveChangesAsync();

        var command = new AssignTaskCommand
        {
            Id = task.Id,
            AssigneeId = assigneeId
        };

        var handler = new AssignTaskCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<AssignTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedTask = await Context.Tasks.FindAsync(task.Id);
        updatedTask!.AssigneeId.Should().Be(assigneeId);
    }

    [Fact]
    public async Task Handle_Should_UnassignTask_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var assigneeId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        var assignee = TestDataFactory.CreateUser(assigneeId);
        Context.Users.Add(user);
        Context.Users.Add(assignee);

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
        task.AssigneeId = assigneeId; // Already assigned
        Context.Tasks.Add(task);

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        var member2 = TestDataFactory.CreateBoardMember(board.Id, assigneeId);
        Context.BoardMembers.Add(member);
        Context.BoardMembers.Add(member2);

        await Context.SaveChangesAsync();

        var command = new AssignTaskCommand
        {
            Id = task.Id,
            AssigneeId = null // Unassign
        };

        var handler = new AssignTaskCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<AssignTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedTask = await Context.Tasks.FindAsync(task.Id);
        updatedTask!.AssigneeId.Should().BeNull();
    }
}
