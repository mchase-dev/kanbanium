using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Boards.Commands.UnarchiveBoard;

public class UnarchiveBoardCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
