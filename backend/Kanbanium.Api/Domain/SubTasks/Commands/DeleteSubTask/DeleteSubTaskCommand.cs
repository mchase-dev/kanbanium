using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.SubTasks.Commands.DeleteSubTask;

public class DeleteSubTaskCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
