using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Sprints.Queries.GetSprintById;

public class GetSprintByIdQuery : IRequest<Result<SprintDto>>
{
    public Guid Id { get; set; }
}
