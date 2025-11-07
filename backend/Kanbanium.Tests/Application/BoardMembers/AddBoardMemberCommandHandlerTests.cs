using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.BoardMembers.Commands.AddBoardMember;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.BoardMembers;

public class AddBoardMemberCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_AddBoardMember_Successfully()
    {
        // Arrange
        var adminId = Guid.NewGuid().ToString();
        var newMemberId = Guid.NewGuid().ToString();
        SetCurrentUser(adminId);

        var admin = TestDataFactory.CreateUser(adminId);
        var newMember = TestDataFactory.CreateUser(newMemberId);
        Context.Users.Add(admin);
        Context.Users.Add(newMember);

        var board = TestDataFactory.CreateBoard();
        Context.Boards.Add(board);
        await Context.SaveChangesAsync();

        var adminMember = TestDataFactory.CreateBoardMember(board.Id, adminId, BoardRole.Admin);
        Context.BoardMembers.Add(adminMember);
        await Context.SaveChangesAsync();

        // Mock UserManager to return the new member
        MockUserManager.Setup(x => x.FindByIdAsync(newMemberId))
            .Returns(Task.FromResult<ApplicationUser?>(newMember));

        var command = new AddBoardMemberCommand
        {
            BoardId = board.Id,
            UserId = newMemberId,
            Role = BoardRole.Member
        };

        var handler = new AddBoardMemberCommandHandler(Context, MockCurrentUserService.Object, MockUserManager.Object, TestHelpers.CreateLogger<AddBoardMemberCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var members = await Context.BoardMembers.Where(m => m.BoardId == board.Id).ToListAsync();
        members.Should().HaveCount(2);
        members.Should().Contain(m => m.UserId == newMemberId && m.Role == BoardRole.Member);
    }

    [Fact]
    public async Task Validator_Should_RequireUserId()
    {
        // Arrange
        var command = new AddBoardMemberCommand
        {
            BoardId = Guid.NewGuid(),
            UserId = string.Empty
        };

        var validator = new AddBoardMemberCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "UserId");
    }
}
