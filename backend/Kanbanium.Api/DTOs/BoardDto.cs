using Kanbanium.Data.Entities;

namespace Kanbanium.DTOs;

public class BoardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<BoardColumnDto> Columns { get; set; } = new();
    public List<BoardMemberDto> Members { get; set; } = new();
}

public class BoardListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ColumnCount { get; set; }
    public int MemberCount { get; set; }
    public int TaskCount { get; set; }
}

public class BoardColumnDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int PositionIndex { get; set; }
}

public class BoardMemberDto
{
    public Guid BoardId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public BoardRole Role { get; set; }
    public UserDto User { get; set; } = null!;
}
