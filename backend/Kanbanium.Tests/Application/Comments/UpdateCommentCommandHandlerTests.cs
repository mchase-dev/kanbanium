using FluentAssertions;
using Kanbanium.Domain.Comments.Commands.UpdateComment;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.Comments;

public class UpdateCommentCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_UpdateComment_Successfully()
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

        var comment = TestDataFactory.CreateComment(task.Id, userId, "Original content");
        Context.Comments.Add(comment);
        await Context.SaveChangesAsync();

        var command = new UpdateCommentCommand
        {
            Id = comment.Id,
            Content = "Updated content"
        };

        var handler = new UpdateCommentCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<UpdateCommentCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedComment = await Context.Comments.FindAsync(comment.Id);
        updatedComment!.Content.Should().Be("Updated content");
    }

    [Fact]
    public async Task Validator_Should_RequireContent()
    {
        // Arrange
        var command = new UpdateCommentCommand
        {
            Id = Guid.NewGuid(),
            Content = string.Empty
        };

        var validator = new UpdateCommentCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Content");
    }
}
