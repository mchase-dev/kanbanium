namespace Kanbanium.DTOs;

public class TaskLabelDto
{
    public Guid TaskId { get; set; }
    public Guid LabelId { get; set; }
    public LabelDto Label { get; set; } = null!;
}
