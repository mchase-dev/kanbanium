using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Boards.Queries.GetBoardById;

public class GetBoardByIdQuery : IRequest<Result<BoardDto>>
{
    public Guid Id { get; set; }
}
