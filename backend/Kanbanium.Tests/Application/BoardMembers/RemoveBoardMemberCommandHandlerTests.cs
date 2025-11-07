using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.BoardMembers.Commands.RemoveBoardMember;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.BoardMembers;

public class RemoveBoardMemberCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_RemoveBoardMember_Successfully()
    {
        // Arrange
        var adminId = Guid.NewGuid().ToString();
        var memberId = Guid.NewGuid().ToString();
        SetCurrentUser(adminId);

        var admin = TestDataFactory.CreateUser(adminId);
        var member = TestDataFactory.CreateUser(memberId);
        Context.Users.Add(admin);
        Context.Users.Add(member);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var adminMember = TestDataFactory.CreateBoardMember(board.Id, adminId, BoardRole.Admin);
        var regularMember = TestDataFactory.CreateBoardMember(board.Id, memberId, BoardRole.Member);
        Context.BoardMembers.Add(adminMember);
        Context.BoardMembers.Add(regularMember);
        await Context.SaveChangesAsync();

        var command = new RemoveBoardMemberCommand
        {
            BoardId = board.Id,
            UserId = memberId
        };

        var handler = new RemoveBoardMemberCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<RemoveBoardMemberCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var members = await Context.BoardMembers.Where(m => m.BoardId == board.Id).ToListAsync();
        members.Should().HaveCount(1);
        members.Should().NotContain(m => m.UserId == memberId);
    }
}
