using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Watchers.Queries.GetWatchers;

public class GetWatchersQuery : IRequest<Result<List<WatcherDto>>>
{
    public Guid TaskId { get; set; }
}
