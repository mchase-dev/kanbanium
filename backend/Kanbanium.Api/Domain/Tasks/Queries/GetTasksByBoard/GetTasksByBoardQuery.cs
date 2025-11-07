using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Queries.GetTasksByBoard;

public class GetTasksByBoardQuery : IRequest<Result<List<TaskListDto>>>
{
    public Guid BoardId { get; set; }
}
