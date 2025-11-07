using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Columns.Commands.ReorderColumns;

public class ReorderColumnsCommand : IRequest<Result>
{
    public Guid BoardId { get; set; }
    public List<ColumnPositionDto> Columns { get; set; } = new();
}

public class ColumnPositionDto
{
    public Guid Id { get; set; }
    public int Position { get; set; }
}
