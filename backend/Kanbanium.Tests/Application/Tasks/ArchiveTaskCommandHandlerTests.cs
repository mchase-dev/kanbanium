using FluentAssertions;
using Kanbanium.Domain.Tasks.Commands.ArchiveTask;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Tasks;

public class ArchiveTaskCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ArchiveTask_Successfully()
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

        var command = new ArchiveTaskCommand { Id = task.Id };
        var handler = new ArchiveTaskCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<ArchiveTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var archivedTask = await Context.Tasks.FindAsync(task.Id);
        archivedTask!.IsArchived.Should().BeTrue();
    }

}
