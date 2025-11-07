using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Columns.Commands.UpdateColumn;

public class UpdateColumnCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? StatusId { get; set; }
    public int? WipLimit { get; set; }
}
