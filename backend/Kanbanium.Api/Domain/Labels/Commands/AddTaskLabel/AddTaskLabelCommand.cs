using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Labels.Commands.AddTaskLabel;

public class AddTaskLabelCommand : IRequest<Result>
{
    public Guid TaskId { get; set; }
    public Guid LabelId { get; set; }
}
