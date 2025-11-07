using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Boards.Commands.ArchiveBoard;

public class ArchiveBoardCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
