using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.SubTasks.Commands.UpdateSubTask;

public class UpdateSubTaskCommand : IRequest<Result<SubTaskDto>>
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
}
