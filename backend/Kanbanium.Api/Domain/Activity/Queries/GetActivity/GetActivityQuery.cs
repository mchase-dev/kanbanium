using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Activity.Queries.GetActivity;

public class GetActivityQuery : IRequest<Result<List<ActivityDto>>>
{
    public string? BoardId { get; set; }
    public string? ActionType { get; set; } // Created, Updated, Deleted, etc.
    public int Limit { get; set; } = 50; // Default to 50 most recent activities
}
