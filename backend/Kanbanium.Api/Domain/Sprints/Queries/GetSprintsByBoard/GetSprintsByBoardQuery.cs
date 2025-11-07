using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Sprints.Queries.GetSprintsByBoard;

public class GetSprintsByBoardQuery : IRequest<Result<List<SprintDto>>>
{
    public Guid BoardId { get; set; }
}
