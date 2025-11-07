using FluentAssertions;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Sprints.Commands.CreateSprint;
using Kanbanium.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Kanbanium.Tests.Application.Sprints;

public class CreateSprintCommandHandlerTests : BaseDbTest
{
    [Fact]
    public async Task Handle_Should_CreateSprint_Successfully()
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
        await Context.SaveChangesAsync();

        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(15);

        var command = new CreateSprintCommand
        {
            BoardId = board.Id,
            Name = "Sprint 1",
            Goal = "Complete user stories",
            StartDate = startDate,
            EndDate = endDate
        };

        var handler = new CreateSprintCommandHandler(Context, MockCurrentUserService.Object, TestHelpers.CreateLogger<CreateSprintCommandHandler>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be("Sprint 1");
        result.Data.Goal.Should().Be("Complete user stories");
        result.Data.Status.Should().Be(SprintStatus.Planned);

        var sprint = await Context.Sprints.FirstOrDefaultAsync(s => s.BoardId == board.Id);
        sprint.Should().NotBeNull();
        sprint!.Name.Should().Be("Sprint 1");
        sprint.Status.Should().Be(SprintStatus.Planned);
    }

    [Fact]
    public async Task Validator_Should_RequireName()
    {
        // Arrange
        var command = new CreateSprintCommand
        {
            BoardId = Guid.NewGuid(),
            Name = string.Empty,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(14)
        };

        var validator = new CreateSprintCommandValidator();

        // Act
        var result = await validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }
}
