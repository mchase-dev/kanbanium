using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Labels.Commands.CreateLabel;

public class CreateLabelCommand : IRequest<Result<LabelDto>>
{
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}
