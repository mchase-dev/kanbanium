using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Columns.Commands.DeleteColumn;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.Columns;

public class DeleteColumnCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_DeleteColumn_Successfully()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        SetCurrentUser(userId);

        var user = TestDataFactory.CreateUser(userId);
        Context.Users.Add(user);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);

        var status = TestDataFactory.CreateStatus();
        Context.Statuses.Add(status);
        await Context.SaveChangesAsync();

        var adminMember = TestDataFactory.CreateBoardMember(board.Id, userId, BoardRole.Admin);
        Context.BoardMembers.Add(adminMember);

        var column = TestDataFactory.CreateColumn(board.Id, "Column to Delete", 0, null, status.Id);
        Context.BoardColumns.Add(column);
        await Context.SaveChangesAsync();

        var command = new DeleteColumnCommand
        {
            Id = column.Id
        };

        var handler = new DeleteColumnCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<DeleteColumnCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify soft delete - use IgnoreQueryFilters to access soft-deleted entities
        var deletedColumn = await Context.BoardColumns.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == column.Id);
        deletedColumn.Should().NotBeNull();
        deletedColumn!.DeletedAt.Should().NotBeNull();
    }
}
