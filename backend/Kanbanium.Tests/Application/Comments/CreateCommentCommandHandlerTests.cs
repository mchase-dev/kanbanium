using FluentAssertions;
using Kanbanium.Domain.Comments.Commands.CreateComment;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Kanbanium.Tests.Application.Comments;

public class CreateCommentCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_CreateComment_Successfully()
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

        var command = new CreateCommentCommand
        {
            TaskId = task.Id,
            Content = "This is a test comment"
        };

        var mockMentionService = new Mock<Kanbanium.Services.IMentionService>();
        mockMentionService.Setup(x => x.ParseMentionsAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<string>());
        var handler = new CreateCommentCommandHandler(Context, MockCurrentUserService.Object, MockNotificationService.Object, mockMentionService.Object, TestHelpers.CreateLogger<CreateCommentCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var comments = await Context.Comments.ToListAsync();
        comments.Should().HaveCount(1);
        comments[0].Content.Should().Be("This is a test comment");
        comments[0].TaskId.Should().Be(task.Id);
        comments[0].UserId.Should().Be(userId);
    }

    [Fact]
    public async Task Validator_Should_RequireContent()
    {
        // Arrange
        var command = new CreateCommentCommand
        {
            TaskId = Guid.NewGuid(),
            Content = string.Empty
        };

        var validator = new CreateCommentCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Content");
    }

    [Fact]
    public async Task Validator_Should_RequireTaskId()
    {
        // Arrange
        var command = new CreateCommentCommand
        {
            TaskId = Guid.Empty,
            Content = "Test comment"
        };

        var validator = new CreateCommentCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "TaskId");
    }
}
