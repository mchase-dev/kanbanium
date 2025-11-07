using Kanbanium.Domain.Labels.Commands.CreateLabel;
using Kanbanium.Domain.Labels.Commands.UpdateLabel;
using Kanbanium.Domain.Labels.Commands.DeleteLabel;
using Kanbanium.Domain.Labels.Commands.AddTaskLabel;
using Kanbanium.Domain.Labels.Commands.RemoveTaskLabel;
using Kanbanium.Domain.Labels.Queries.GetLabelsByBoard;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kanbanium.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LabelsController : ControllerBase
{
    private readonly IMediator _mediator;

    public LabelsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all labels for a board
    /// </summary>
    [HttpGet("board/{boardId}")]
    public async Task<IActionResult> GetLabelsByBoard(Guid boardId)
    {
        var query = new GetLabelsByBoardQuery { BoardId = boardId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Create a new label
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateLabel([FromBody] CreateLabelCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Update an existing label
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLabel(Guid id, [FromBody] UpdateLabelCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Delete a label
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLabel(Guid id)
    {
        var command = new DeleteLabelCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Add a label to a task
    /// </summary>
    [HttpPost("tasks/{taskId}/labels/{labelId}")]
    public async Task<IActionResult> AddTaskLabel(Guid taskId, Guid labelId)
    {
        var command = new AddTaskLabelCommand
        {
            TaskId = taskId,
            LabelId = labelId
        };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Remove a label from a task
    /// </summary>
    [HttpDelete("tasks/{taskId}/labels/{labelId}")]
    public async Task<IActionResult> RemoveTaskLabel(Guid taskId, Guid labelId)
    {
        var command = new RemoveTaskLabelCommand
        {
            TaskId = taskId,
            LabelId = labelId
        };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
