using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Comments.Commands.DeleteComment;

public class DeleteCommentCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
