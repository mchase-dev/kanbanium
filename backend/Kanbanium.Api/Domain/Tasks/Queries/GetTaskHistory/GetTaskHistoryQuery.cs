using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Queries.GetTaskHistory;

public class GetTaskHistoryQuery : IRequest<Result<List<TaskHistoryDto>>>
{
    public Guid TaskId { get; set; }
}
