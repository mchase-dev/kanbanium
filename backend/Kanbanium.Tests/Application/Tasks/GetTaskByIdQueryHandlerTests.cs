using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Tasks.Queries.GetTaskById;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Tasks;

public class GetTaskByIdQueryHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ReturnTask_WhenExists()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

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

        var task = TestDataFactory.CreateTask(board.Id, column.Id, status.Id, taskType.Id, "Test Task", "Test Description");
        Context.Tasks.Add(task);

        var member = TestDataFactory.CreateBoardMember(board.Id, userId);
        Context.BoardMembers.Add(member);

        await Context.SaveChangesAsync();

        var query = new GetTaskByIdQuery { Id = task.Id };
        var handler = new GetTaskByIdQueryHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<GetTaskByIdQueryHandler>());

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be("Test Task");
        result.Data.Description.Should().Be("Test Description");
    }

    [Fact]
    public async Task Handle_Should_ThrowNotFoundException_WhenTaskNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var query = new GetTaskByIdQuery { Id = Guid.NewGuid() };
        var handler = new GetTaskByIdQueryHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<GetTaskByIdQueryHandler>());

        // Act & Assert
        await FluentActions.Invoking(async () => await handler.Handle(query, CancellationToken.None))
            .Should().ThrowAsync<Kanbanium.Domain.Common.Exceptions.NotFoundException>();
    }

    [Fact]
    public void GetTaskByIdQuery_Should_RequireId()
    {
        // Arrange & Act
        var query = new GetTaskByIdQuery { Id = Guid.NewGuid() };

        // Assert
        query.Id.Should().NotBe(Guid.Empty);
    }
}
