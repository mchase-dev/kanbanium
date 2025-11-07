using Kanbanium.Domain.Activity.Queries.GetActivity;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kanbanium.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivityController : ControllerBase
{
    private readonly IMediator _mediator;

    public ActivityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get recent activity across all boards the current user is a member of
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetActivity(
        [FromQuery] string? boardId = null,
        [FromQuery] string? actionType = null,
        [FromQuery] int limit = 50)
    {
        var query = new GetActivityQuery
        {
            BoardId = boardId,
            ActionType = actionType,
            Limit = limit
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
