using Kanbanium.Data.Entities;
using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.BoardMembers.Commands.AddBoardMember;

public class AddBoardMemberCommand : IRequest<Result>
{
    public Guid BoardId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public BoardRole Role { get; set; } = BoardRole.Member;
}
