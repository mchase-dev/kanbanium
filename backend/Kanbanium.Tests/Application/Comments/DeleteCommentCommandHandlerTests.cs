using FluentAssertions;
using Kanbanium.Domain.Comments.Commands.DeleteComment;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.Comments;

public class DeleteCommentCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_DeleteComment_Successfully()
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

        var comment = TestDataFactory.CreateComment(task.Id, userId, "Test comment");
        Context.Comments.Add(comment);
        await Context.SaveChangesAsync();

        var command = new DeleteCommentCommand { Id = comment.Id };
        var handler = new DeleteCommentCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<DeleteCommentCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var deletedComment = await Context.Comments.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == comment.Id);
        deletedComment.Should().NotBeNull();
        deletedComment!.DeletedAt.Should().NotBeNull();
    }

}
