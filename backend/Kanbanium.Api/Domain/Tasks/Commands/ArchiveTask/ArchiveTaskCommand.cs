using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Commands.ArchiveTask;

public class ArchiveTaskCommand : IRequest<Result<TaskDto>>
{
    public Guid Id { get; set; }
}
