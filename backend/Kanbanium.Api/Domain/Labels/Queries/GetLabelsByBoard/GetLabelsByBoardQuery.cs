using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Labels.Queries.GetLabelsByBoard;

public class GetLabelsByBoardQuery : IRequest<Result<List<LabelDto>>>
{
    public Guid BoardId { get; set; }
}
