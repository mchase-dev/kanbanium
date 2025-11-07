using Kanbanium.Data.Entities;

namespace Kanbanium.DTOs;

public class StatusDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public StatusCategory Category { get; set; }
    public string Color { get; set; } = string.Empty;
}
