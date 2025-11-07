using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Attachments.Commands.UploadAttachment;

public class UploadAttachmentCommand : IRequest<Result<AttachmentDto>>
{
    public Guid TaskId { get; set; }
    public Stream FileStream { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
}
