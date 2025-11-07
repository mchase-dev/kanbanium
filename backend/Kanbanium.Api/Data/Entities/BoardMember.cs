namespace Kanbanium.Data.Entities;

public class BoardMember : BaseAuditableEntity
{
    public Guid BoardId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public BoardRole Role { get; set; }
    public DateTime JoinedAt { get; set; }

    // Navigation properties
    public Board Board { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
