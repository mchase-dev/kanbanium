using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.SubTasks.Commands.CreateSubTask;

public class CreateSubTaskCommand : IRequest<Result<SubTaskDto>>
{
    public Guid TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
}
