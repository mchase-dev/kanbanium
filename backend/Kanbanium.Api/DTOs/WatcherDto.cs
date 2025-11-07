namespace Kanbanium.DTOs;

public class WatcherDto
{
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public UserDto User { get; set; } = null!;
}
