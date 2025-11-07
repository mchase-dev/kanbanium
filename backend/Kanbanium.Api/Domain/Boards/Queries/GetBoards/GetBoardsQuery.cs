using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Boards.Queries.GetBoards;

public class GetBoardsQuery : IRequest<Result<List<BoardListDto>>>
{
}
