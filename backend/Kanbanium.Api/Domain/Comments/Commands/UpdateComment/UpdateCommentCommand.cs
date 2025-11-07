using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Comments.Commands.UpdateComment;

public class UpdateCommentCommand : IRequest<Result<CommentDto>>
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
}
