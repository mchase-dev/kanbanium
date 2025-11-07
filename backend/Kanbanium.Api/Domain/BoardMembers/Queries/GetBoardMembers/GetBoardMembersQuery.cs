using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.BoardMembers.Queries.GetBoardMembers;

public class GetBoardMembersQuery : IRequest<Result<List<BoardMemberDto>>>
{
    public Guid BoardId { get; set; }
}
