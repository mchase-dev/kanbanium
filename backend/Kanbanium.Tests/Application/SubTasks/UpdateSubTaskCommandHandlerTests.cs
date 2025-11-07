using FluentAssertions;
using Kanbanium.Domain.SubTasks.Commands.UpdateSubTask;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.SubTasks;

public class UpdateSubTaskCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_UpdateSubTask_Successfully()
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

        var subTask = TestDataFactory.CreateSubTask(task.Id, "Original Title", false);
        Context.SubTasks.Add(subTask);
        await Context.SaveChangesAsync();

        var command = new UpdateSubTaskCommand
        {
            Id = subTask.Id,
            Title = "Updated Title"
        };

        var handler = new UpdateSubTaskCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<UpdateSubTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedSubTask = await Context.SubTasks.FindAsync(subTask.Id);
        updatedSubTask!.Title.Should().Be("Updated Title");
    }

    [Fact]
    public async Task Validator_Should_RequireTitle()
    {
        // Arrange
        var command = new UpdateSubTaskCommand
        {
            Id = Guid.NewGuid(),
            Title = string.Empty
        };

        var validator = new UpdateSubTaskCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Title");
    }
}
