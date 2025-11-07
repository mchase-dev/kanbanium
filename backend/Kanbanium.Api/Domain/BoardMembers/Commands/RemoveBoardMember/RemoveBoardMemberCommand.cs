using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.BoardMembers.Commands.RemoveBoardMember;

public class RemoveBoardMemberCommand : IRequest<Result>
{
    public Guid BoardId { get; set; }
    public string UserId { get; set; } = string.Empty;
}
