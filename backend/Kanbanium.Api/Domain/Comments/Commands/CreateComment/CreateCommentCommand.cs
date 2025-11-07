using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Comments.Commands.CreateComment;

public class CreateCommentCommand : IRequest<Result<CommentDto>>
{
    public Guid TaskId { get; set; }
    public string Content { get; set; } = string.Empty;
}
