using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Boards.Commands.UpdateBoard;

public class UpdateBoardCommand : IRequest<Result<BoardDto>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? BackgroundColor { get; set; }
}
