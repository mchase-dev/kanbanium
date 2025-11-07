using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Queries.GetTaskById;

public class GetTaskByIdQuery : IRequest<Result<TaskDto>>
{
    public Guid Id { get; set; }
}
