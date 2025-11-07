using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Attachments.Commands.DeleteAttachment;

public class DeleteAttachmentCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
