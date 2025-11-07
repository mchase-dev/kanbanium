using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Comments.Queries.GetCommentsByTask;

public class GetCommentsByTaskQuery : IRequest<Result<List<CommentDto>>>
{
    public Guid TaskId { get; set; }
}
