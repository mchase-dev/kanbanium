namespace Kanbanium.Data.Entities;

public class Comment : BaseAuditableEntity
{
    public Guid TaskId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }

    // Navigation properties
    public TaskItem Task { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public Comment? ParentComment { get; set; }
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
}
