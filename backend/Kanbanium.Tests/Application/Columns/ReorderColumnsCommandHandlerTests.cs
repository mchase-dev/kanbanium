using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Columns.Commands.ReorderColumns;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.Columns;

public class ReorderColumnsCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_ReorderColumns_Successfully()
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

        var member = TestDataFactory.CreateBoardMember(board.Id, userId, BoardRole.Member);
        Context.BoardMembers.Add(member);

        // Create 3 columns with initial positions 0, 1, 2
        var column1 = TestDataFactory.CreateColumn(board.Id, "Column 1", 0, null, status.Id);
        var column2 = TestDataFactory.CreateColumn(board.Id, "Column 2", 1, null, status.Id);
        var column3 = TestDataFactory.CreateColumn(board.Id, "Column 3", 2, null, status.Id);
        Context.BoardColumns.AddRange(column1, column2, column3);
        await Context.SaveChangesAsync();

        // Reorder: swap column1 (0) and column3 (2)
        var command = new ReorderColumnsCommand
        {
            BoardId = board.Id,
            Columns = new List<ColumnPositionDto>
            {
                new ColumnPositionDto { Id = column1.Id, Position = 2 },
                new ColumnPositionDto { Id = column2.Id, Position = 1 },
                new ColumnPositionDto { Id = column3.Id, Position = 0 }
            }
        };

        var handler = new ReorderColumnsCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<ReorderColumnsCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedColumns = await Context.BoardColumns
            .Where(c => c.BoardId == board.Id)
            .OrderBy(c => c.Position)
            .ToListAsync();

        updatedColumns.Should().HaveCount(3);
        updatedColumns[0].Id.Should().Be(column3.Id); // Position 0
        updatedColumns[1].Id.Should().Be(column2.Id); // Position 1
        updatedColumns[2].Id.Should().Be(column1.Id); // Position 2
    }
}
