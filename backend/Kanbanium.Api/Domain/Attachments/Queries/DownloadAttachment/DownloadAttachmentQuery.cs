using MediatR;

namespace Kanbanium.Domain.Attachments.Queries.DownloadAttachment;

public class DownloadAttachmentQuery : IRequest<(Stream Stream, string FileName, string ContentType)>
{
    public Guid Id { get; set; }
}
