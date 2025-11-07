using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Sprints.Commands.UpdateSprint;

public class UpdateSprintCommand : IRequest<Result<SprintDto>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
