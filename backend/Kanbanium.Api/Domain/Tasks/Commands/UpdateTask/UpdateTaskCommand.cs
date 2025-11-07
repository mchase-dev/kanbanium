using Kanbanium.Data.Entities;
using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Commands.UpdateTask;

public class UpdateTaskCommand : IRequest<Result<TaskDto>>
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid StatusId { get; set; }
    public Guid TypeId { get; set; }
    public Guid? SprintId { get; set; }
    public string? AssigneeId { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
}
