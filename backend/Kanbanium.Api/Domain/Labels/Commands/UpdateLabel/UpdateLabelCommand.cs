using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Labels.Commands.UpdateLabel;

public class UpdateLabelCommand : IRequest<Result<LabelDto>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}
