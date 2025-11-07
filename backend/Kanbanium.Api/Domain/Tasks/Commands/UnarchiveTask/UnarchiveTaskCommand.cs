using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Commands.UnarchiveTask;

public class UnarchiveTaskCommand : IRequest<Result<TaskDto>>
{
    public Guid Id { get; set; }
}
