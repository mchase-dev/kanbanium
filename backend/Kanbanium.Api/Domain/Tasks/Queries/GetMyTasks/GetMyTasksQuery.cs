using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Queries.GetMyTasks;

public class GetMyTasksQuery : IRequest<Result<List<MyTaskDto>>>
{
    public string? BoardId { get; set; }
    public string? StatusId { get; set; }
    public int? Priority { get; set; }
    public bool? IsOverdue { get; set; }
    public string? SortBy { get; set; } = "DueDate"; // DueDate, Priority, CreatedAt
}
