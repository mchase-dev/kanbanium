using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Sprints.Commands.DeleteSprint;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.Sprints;

public class DeleteSprintCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_DeleteSprint_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var adminMember = TestDataFactory.CreateBoardMember(board.Id, userId, BoardRole.Admin);
        Context.BoardMembers.Add(adminMember);

        var sprint = TestDataFactory.CreateSprint(board.Id, "Sprint to Delete");
        Context.Sprints.Add(sprint);
        await Context.SaveChangesAsync();

        var command = new DeleteSprintCommand
        {
            Id = sprint.Id
        };

        var handler = new DeleteSprintCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<DeleteSprintCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify soft delete - use IgnoreQueryFilters to access soft-deleted entities
        var deletedSprint = await Context.Sprints.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.Id == sprint.Id);
        deletedSprint.Should().NotBeNull();
        deletedSprint!.DeletedAt.Should().NotBeNull();
    }
}
