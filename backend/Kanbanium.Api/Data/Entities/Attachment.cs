namespace Kanbanium.Data.Entities;

public class Attachment : BaseAuditableEntity
{
    public Guid TaskId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }

    // Navigation properties
    public TaskItem Task { get; set; } = null!;
}
