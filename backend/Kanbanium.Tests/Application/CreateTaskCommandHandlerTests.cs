using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Tasks.Commands.CreateTask;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application;

public class CreateTaskCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_CreateTask_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard("Test Board");
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var boardId = board.Id;

        var column = TestDataFactory.CreateColumn(boardId, "To Do");
        Context.Columns.Add(column);

        var status = TestDataFactory.CreateStatus("To Do", StatusCategory.ToDo);
        Context.Statuses.Add(status);

        var taskType = TestDataFactory.CreateTaskType("Task");
        Context.TaskTypes.Add(taskType);

        await Context.SaveChangesAsync();

        var member = TestDataFactory.CreateBoardMember(boardId, userId, BoardRole.Member);
        Context.BoardMembers.Add(member);
        await Context.SaveChangesAsync();

        var command = new CreateTaskCommand
        {
            BoardId = boardId,
            ColumnId = column.Id,
            Title = "Test Task",
            Description = "Test Description",
            Priority = Priority.High,
            StatusId = status.Id,
            TypeId = taskType.Id
        };

        var handler = new CreateTaskCommandHandler(Context, MockCurrentUserService.Object, MockNotificationService.Object, TestHelpers.CreateLogger<CreateTaskCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be("Test Task");
        result.Data.Description.Should().Be("Test Description");
        result.Data.Priority.Should().Be(Priority.High);

        // Verify task was created in database
        var task = await Context.Tasks.FirstOrDefaultAsync();
        task.Should().NotBeNull();
        task!.Title.Should().Be("Test Task");
        task.BoardId.Should().Be(boardId);
        task.ColumnId.Should().Be(column.Id);
        task.Priority.Should().Be(Priority.High);
    }

    [Fact]
    public async Task Handle_Should_ReturnError_WhenTitleIsEmpty()
    {
        // Arrange
        var command = new CreateTaskCommand
        {
            BoardId = Guid.NewGuid(),
            ColumnId = Guid.NewGuid(),
            Title = string.Empty,
            StatusId = Guid.NewGuid(),
            TypeId = Guid.NewGuid()
        };

        var validator = new CreateTaskCommandValidator();

        // Act
        var validationResult = await validator.ValidateAsync(command);

        // Assert
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().Contain(e => e.PropertyName == "Title");
    }

    [Fact]
    public async Task Handle_Should_SetAuditFields()
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

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        Context.BoardMembers.Add(member);
        await Context.SaveChangesAsync();

        var command = new CreateTaskCommand
        {
            BoardId = board.Id,
            ColumnId = column.Id,
            Title = "Test Task",
            StatusId = status.Id,
            TypeId = taskType.Id
        };

        var handler = new CreateTaskCommandHandler(Context, MockCurrentUserService.Object, MockNotificationService.Object, TestHelpers.CreateLogger<CreateTaskCommandHandler>());

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        var task = await Context.Tasks.FirstOrDefaultAsync();
        task.Should().NotBeNull();
        task!.CreatedBy.Should().Be(userId);
        task.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
}
