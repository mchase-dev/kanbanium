using Kanbanium.Domain.Attachments.Commands.DeleteAttachment;
using Kanbanium.Domain.Attachments.Commands.UploadAttachment;
using Kanbanium.Domain.Attachments.Queries.DownloadAttachment;
using Kanbanium.Domain.Attachments.Queries.GetAttachmentsByTask;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kanbanium.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttachmentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AttachmentsController> _logger;

    public AttachmentsController(IMediator mediator, ILogger<AttachmentsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    // GET: api/attachments/task/{taskId}
    [HttpGet("task/{taskId}")]
    public async Task<IActionResult> GetAttachmentsByTask(Guid taskId)
    {
        var query = new GetAttachmentsByTaskQuery { TaskId = taskId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    // POST: api/attachments
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit
    public async Task<IActionResult> UploadAttachment([FromForm] IFormFile file, [FromForm] Guid taskId)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        using var stream = file.OpenReadStream();
        var command = new UploadAttachmentCommand
        {
            TaskId = taskId,
            FileStream = stream,
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    // GET: api/attachments/{id}/download
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadAttachment(Guid id)
    {
        var query = new DownloadAttachmentQuery { Id = id };
        var (stream, fileName, contentType) = await _mediator.Send(query);

        return File(stream, contentType, fileName);
    }

    // DELETE: api/attachments/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttachment(Guid id)
    {
        var command = new DeleteAttachmentCommand { Id = id };
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
