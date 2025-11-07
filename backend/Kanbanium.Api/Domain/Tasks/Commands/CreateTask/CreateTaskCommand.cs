using Kanbanium.Data.Entities;
using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Commands.CreateTask;

public class CreateTaskCommand : IRequest<Result<TaskDto>>
{
    public Guid BoardId { get; set; }
    public Guid ColumnId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid StatusId { get; set; }
    public Guid TypeId { get; set; }
    public Guid? SprintId { get; set; }
    public string? AssigneeId { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public DateTime? DueDate { get; set; }
}
