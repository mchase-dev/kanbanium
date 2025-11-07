using Kanbanium.Data.Entities;
using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Queries.SearchTasks;

public class SearchTasksQuery : IRequest<Result<List<TaskListDto>>>
{
    public Guid BoardId { get; set; }
    public string? SearchTerm { get; set; }
    public Guid? StatusId { get; set; }
    public Guid? TypeId { get; set; }
    public string? AssigneeId { get; set; }
    public Priority? Priority { get; set; }
    public Guid? SprintId { get; set; }
    public bool? IsArchived { get; set; }
    public Guid? LabelId { get; set; }
}
