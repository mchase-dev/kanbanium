using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Commands.DeleteTask;

public class DeleteTaskCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
