using Kanbanium.Domain.SubTasks.Commands.CreateSubTask;
using Kanbanium.Domain.SubTasks.Commands.DeleteSubTask;
using Kanbanium.Domain.SubTasks.Commands.ToggleSubTask;
using Kanbanium.Domain.SubTasks.Commands.UpdateSubTask;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kanbanium.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubTasksController : ControllerBase
{
    private readonly IMediator _mediator;

    public SubTasksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Create a new subtask
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateSubTask([FromBody] CreateSubTaskCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Update an existing subtask
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSubTask(Guid id, [FromBody] UpdateSubTaskCommand command)
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
    /// Delete a subtask
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSubTask(Guid id)
    {
        var command = new DeleteSubTaskCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Toggle subtask completion status
    /// </summary>
    [HttpPost("{id}/toggle")]
    public async Task<IActionResult> ToggleSubTask(Guid id)
    {
        var command = new ToggleSubTaskCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
