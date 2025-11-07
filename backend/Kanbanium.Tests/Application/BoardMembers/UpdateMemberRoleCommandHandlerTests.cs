using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.BoardMembers.Commands.UpdateMemberRole;
using Kanbanium.Tests.Common;
using Xunit;

namespace Kanbanium.Tests.Application.BoardMembers;

public class UpdateMemberRoleCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_UpdateMemberRole_Successfully()
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

        var command = new UpdateMemberRoleCommand
        {
            BoardId = board.Id,
            UserId = memberId,
            Role = BoardRole.Admin
        };

        var handler = new UpdateMemberRoleCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<UpdateMemberRoleCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedMember = await Context.BoardMembers.FindAsync(regularMember.Id);
        updatedMember!.Role.Should().Be(BoardRole.Admin);
    }
}
