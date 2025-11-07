using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Labels.Commands.RemoveTaskLabel;

public class RemoveTaskLabelCommand : IRequest<Result>
{
    public Guid TaskId { get; set; }
    public Guid LabelId { get; set; }
}
