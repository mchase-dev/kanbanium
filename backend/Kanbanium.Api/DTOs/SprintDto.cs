using Kanbanium.Data.Entities;

namespace Kanbanium.DTOs;

public class SprintDto
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public SprintStatus Status { get; set; }
    public int TaskCount { get; set; }
    public int CompletedTaskCount { get; set; }
}
