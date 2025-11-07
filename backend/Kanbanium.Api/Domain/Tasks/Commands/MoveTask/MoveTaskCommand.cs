using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Tasks.Commands.MoveTask;

public class MoveTaskCommand : IRequest<Result<TaskDto>>
{
    public Guid Id { get; set; }
    public Guid ColumnId { get; set; }
    public int PositionIndex { get; set; }
}
