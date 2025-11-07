using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Watchers.Commands.RemoveWatcher;

public class RemoveWatcherCommand : IRequest<Result<bool>>
{
    public Guid TaskId { get; set; }
}
