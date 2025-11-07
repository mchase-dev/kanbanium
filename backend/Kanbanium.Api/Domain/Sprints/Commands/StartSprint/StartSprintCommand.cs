using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Sprints.Commands.StartSprint;

public class StartSprintCommand : IRequest<Result<SprintDto>>
{
    public Guid Id { get; set; }
}
