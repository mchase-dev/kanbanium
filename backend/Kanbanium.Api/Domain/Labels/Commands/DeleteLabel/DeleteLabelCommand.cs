using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Labels.Commands.DeleteLabel;

public class DeleteLabelCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
