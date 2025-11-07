using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Columns.Commands.DeleteColumn;

public class DeleteColumnCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
