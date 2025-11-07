using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Sprints.Commands.CompleteSprint;

public class CompleteSprintCommand : IRequest<Result<SprintDto>>
{
    public Guid Id { get; set; }
}
