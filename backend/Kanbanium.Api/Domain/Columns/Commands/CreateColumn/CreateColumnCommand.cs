using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Columns.Commands.CreateColumn;

public class CreateColumnCommand : IRequest<Result<BoardColumnDto>>
{
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? StatusId { get; set; }
    public int? WipLimit { get; set; }
}
