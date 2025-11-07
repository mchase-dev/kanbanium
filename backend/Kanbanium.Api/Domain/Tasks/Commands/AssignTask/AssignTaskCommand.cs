using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Commands.AssignTask;

public class AssignTaskCommand : IRequest<Result<TaskDto>>
{
    public Guid Id { get; set; }
    public string? AssigneeId { get; set; }
}
