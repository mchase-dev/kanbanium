using Kanbanium.Domain.ReferenceData.Queries.GetStatuses;
using Kanbanium.Domain.ReferenceData.Queries.GetTaskTypes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kanbanium.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReferenceDataController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReferenceDataController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all task statuses
    /// </summary>
    [HttpGet("statuses")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any, VaryByHeader = "Authorization")] // Cache for 1 hour
    public async Task<IActionResult> GetStatuses()
    {
        var query = new GetStatusesQuery();
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get all task types
    /// </summary>
    [HttpGet("task-types")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any, VaryByHeader = "Authorization")] // Cache for 1 hour
    public async Task<IActionResult> GetTaskTypes()
    {
        var query = new GetTaskTypesQuery();
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
