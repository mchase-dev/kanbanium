using Kanbanium.Domain.Users.Commands.CreateUser;
using Kanbanium.Domain.Users.Commands.DisableUser;
using Kanbanium.Domain.Users.Commands.EnableUser;
using Kanbanium.Domain.Users.Commands.UpdateUser;
using Kanbanium.Domain.Users.Queries.GetAllUsers;
using Kanbanium.Domain.Users.Queries.SearchUsers;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kanbanium.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("search")]
    public async Task<ActionResult<Result<List<UserDto>>>> SearchUsers([FromQuery] string? searchTerm)
    {
        var result = await _mediator.Send(new SearchUsersQuery(searchTerm));
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<Result<PaginatedList<UserDto>>>> GetAllUsers(
        [FromQuery] string? searchTerm,
        [FromQuery] string? role,
        [FromQuery] bool? includeDeleted,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetAllUsersQuery(searchTerm, role, includeDeleted, page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Result<UserDto>>> CreateUser([FromBody] CreateUserCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Result<UserDto>>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        var command = new UpdateUserCommand(id, request.FirstName, request.LastName, request.Email, request.Role);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("{id}/disable")]
    public async Task<ActionResult<Result>> DisableUser(string id)
    {
        var result = await _mediator.Send(new DisableUserCommand(id));
        return Ok(result);
    }

    [HttpPost("{id}/enable")]
    public async Task<ActionResult<Result>> EnableUser(string id)
    {
        var result = await _mediator.Send(new EnableUserCommand(id));
        return Ok(result);
    }
}

public class UpdateUserRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
}
