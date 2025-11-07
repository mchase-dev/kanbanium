using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.SubTasks.Commands.ToggleSubTask;

public class ToggleSubTaskCommand : IRequest<Result<SubTaskDto>>
{
    public Guid Id { get; set; }
}
