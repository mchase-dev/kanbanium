using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.ReferenceData.Queries.GetStatuses;

public class GetStatusesQuery : IRequest<Result<List<StatusDto>>>
{
}
