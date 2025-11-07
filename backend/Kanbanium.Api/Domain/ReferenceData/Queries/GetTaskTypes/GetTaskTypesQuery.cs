using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.ReferenceData.Queries.GetTaskTypes;

public class GetTaskTypesQuery : IRequest<Result<List<TaskTypeDto>>>
{
}
