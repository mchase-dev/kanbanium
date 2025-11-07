using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Sprints.Commands.DeleteSprint;

public class DeleteSprintCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
