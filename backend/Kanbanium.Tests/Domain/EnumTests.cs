using FluentAssertions;
using Kanbanium.Data.Entities;
using Xunit;

namespace Kanbanium.Tests.Domain;

public class EnumTests
{
    [Fact]
    public void Priority_ShouldHaveExpectedValues()
    {
        // Assert
        Enum.GetValues<Priority>().Should().BeEquivalentTo(new[]
        {
            Priority.Low,
            Priority.Medium,
            Priority.High,
            Priority.Critical
        });
    }

    [Fact]
    public void Priority_ShouldHaveCorrectNumericValues()
    {
        // Assert
        ((int)Priority.Low).Should().Be(0);
        ((int)Priority.Medium).Should().Be(1);
        ((int)Priority.High).Should().Be(2);
        ((int)Priority.Critical).Should().Be(3);
    }

    [Fact]
    public void StatusCategory_ShouldHaveExpectedValues()
    {
        // Assert
        Enum.GetValues<StatusCategory>().Should().BeEquivalentTo(new[]
        {
            StatusCategory.ToDo,
            StatusCategory.InProgress,
            StatusCategory.Done
        });
    }

    [Fact]
    public void BoardRole_ShouldHaveExpectedValues()
    {
        // Assert
        Enum.GetValues<BoardRole>().Should().BeEquivalentTo(new[]
        {
            BoardRole.Admin,
            BoardRole.Member,
            BoardRole.Viewer
        });
    }

    [Fact]
    public void BoardRole_Admin_ShouldHaveHighestPermissions()
    {
        // Assert - Admin should have highest permissions value (2)
        ((int)BoardRole.Admin).Should().Be(2);
    }

    [Fact]
    public void SprintStatus_ShouldHaveExpectedValues()
    {
        // Assert
        Enum.GetValues<SprintStatus>().Should().BeEquivalentTo(new[]
        {
            SprintStatus.Planned,
            SprintStatus.Active,
            SprintStatus.Completed
        });
    }

    [Theory]
    [InlineData(StatusCategory.ToDo, 0)]
    [InlineData(StatusCategory.InProgress, 1)]
    [InlineData(StatusCategory.Done, 2)]
    public void StatusCategory_ShouldHaveCorrectNumericValues(StatusCategory category, int expectedValue)
    {
        // Assert
        ((int)category).Should().Be(expectedValue);
    }

    [Theory]
    [InlineData(SprintStatus.Planned, 0)]
    [InlineData(SprintStatus.Active, 1)]
    [InlineData(SprintStatus.Completed, 2)]
    public void SprintStatus_ShouldHaveCorrectNumericValues(SprintStatus status, int expectedValue)
    {
        // Assert
        ((int)status).Should().Be(expectedValue);
    }
}
