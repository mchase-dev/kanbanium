using FluentAssertions;
using Kanbanium.Domain.Tasks.Commands.DeleteTask;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.Tasks;

public class DeleteTaskCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_DeleteTask_Successfully()
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

        var command = new DeleteTaskCommand { Id = task.Id };
        var handler = new DeleteTaskCommandHandler(Context, MockCurrentUserService.Object, MockNotificationService.Object, TestHelpers.CreateLogger<DeleteTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var deletedTask = await Context.Tasks.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == task.Id);
        deletedTask.Should().NotBeNull();
        deletedTask!.DeletedAt.Should().NotBeNull();
    }

}
