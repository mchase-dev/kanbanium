using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Queries.GetTasksByColumn;

public class GetTasksByColumnQuery : IRequest<Result<List<TaskListDto>>>
{
    public Guid ColumnId { get; set; }
}
