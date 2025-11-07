using FluentAssertions;
using Kanbanium.Domain.SubTasks.Commands.CreateSubTask;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.SubTasks;

public class CreateSubTaskCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_CreateSubTask_Successfully()
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

        var command = new CreateSubTaskCommand
        {
            TaskId = task.Id,
            Title = "Test SubTask"
        };

        var handler = new CreateSubTaskCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<CreateSubTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var subTasks = await Context.SubTasks.Where(st => st.TaskId == task.Id).ToListAsync();
        subTasks.Should().HaveCount(1);
        subTasks[0].Title.Should().Be("Test SubTask");
        subTasks[0].IsCompleted.Should().BeFalse();
    }

    [Fact]
    public async Task Validator_Should_RequireTitle()
    {
        // Arrange
        var command = new CreateSubTaskCommand
        {
            TaskId = Guid.NewGuid(),
            Title = string.Empty
        };

        var validator = new CreateSubTaskCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Title");
    }
}
