using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Attachments.Queries.GetAttachmentsByTask;

public class GetAttachmentsByTaskQuery : IRequest<Result<List<AttachmentDto>>>
{
    public Guid TaskId { get; set; }
}
