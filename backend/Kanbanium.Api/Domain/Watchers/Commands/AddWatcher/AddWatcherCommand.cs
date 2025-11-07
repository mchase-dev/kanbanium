using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Watchers.Commands.AddWatcher;

public class AddWatcherCommand : IRequest<Result<bool>>
{
    public Guid TaskId { get; set; }
}
