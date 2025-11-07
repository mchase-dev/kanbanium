using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Boards.Commands.CreateBoard;

public class CreateBoardCommand : IRequest<Result<BoardDto>>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
