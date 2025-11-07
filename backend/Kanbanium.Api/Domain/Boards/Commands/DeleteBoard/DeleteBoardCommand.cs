using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Boards.Commands.DeleteBoard;

public class DeleteBoardCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
