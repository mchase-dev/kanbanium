using Kanbanium.Domain.Sprints.Commands.CompleteSprint;
using Kanbanium.Domain.Sprints.Commands.CreateSprint;
using Kanbanium.Domain.Sprints.Commands.DeleteSprint;
using Kanbanium.Domain.Sprints.Commands.StartSprint;
using Kanbanium.Domain.Sprints.Commands.UpdateSprint;
using Kanbanium.Domain.Sprints.Queries.GetSprintById;
using Kanbanium.Domain.Sprints.Queries.GetSprintsByBoard;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kanbanium.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SprintsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SprintsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all sprints for a board
    /// </summary>
    [HttpGet("board/{boardId}")]
    public async Task<IActionResult> GetSprintsByBoard(Guid boardId)
    {
        var query = new GetSprintsByBoardQuery { BoardId = boardId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get a specific sprint by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSprintById(Guid id)
    {
        var query = new GetSprintByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Create a new sprint
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateSprint([FromBody] CreateSprintCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetSprintById), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Update an existing sprint
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSprint(Guid id, [FromBody] UpdateSprintCommand command)
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
    /// Delete a sprint
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSprint(Guid id)
    {
        var command = new DeleteSprintCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Start a sprint
    /// </summary>
    [HttpPost("{id}/start")]
    public async Task<IActionResult> StartSprint(Guid id)
    {
        var command = new StartSprintCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Complete a sprint
    /// </summary>
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteSprint(Guid id)
    {
        var command = new CompleteSprintCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
