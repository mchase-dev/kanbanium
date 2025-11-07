using Kanbanium.Domain.BoardMembers.Commands.AddBoardMember;
using Kanbanium.Domain.BoardMembers.Commands.RemoveBoardMember;
using Kanbanium.Domain.BoardMembers.Commands.UpdateMemberRole;
using Kanbanium.Domain.BoardMembers.Queries.GetBoardMembers;
using Kanbanium.Domain.Boards.Commands.ArchiveBoard;
using Kanbanium.Domain.Boards.Commands.CreateBoard;
using Kanbanium.Domain.Boards.Commands.DeleteBoard;
using Kanbanium.Domain.Boards.Commands.UnarchiveBoard;
using Kanbanium.Domain.Boards.Commands.UpdateBoard;
using Kanbanium.Domain.Boards.Queries.GetBoardById;
using Kanbanium.Domain.Boards.Queries.GetBoards;
using Kanbanium.Domain.Columns.Commands.CreateColumn;
using Kanbanium.Domain.Columns.Commands.DeleteColumn;
using Kanbanium.Domain.Columns.Commands.ReorderColumns;
using Kanbanium.Domain.Columns.Commands.UpdateColumn;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kanbanium.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BoardsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BoardsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetBoards()
    {
        var result = await _mediator.Send(new GetBoardsQuery());

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBoardById(Guid id)
    {
        var result = await _mediator.Send(new GetBoardByIdQuery { Id = id });

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBoard([FromBody] CreateBoardCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return CreatedAtAction(nameof(GetBoardById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBoard(Guid id, [FromBody] UpdateBoardCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(Guid id)
    {
        var result = await _mediator.Send(new DeleteBoardCommand { Id = id });

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return NoContent();
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> ArchiveBoard(Guid id)
    {
        var result = await _mediator.Send(new ArchiveBoardCommand { Id = id });

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return NoContent();
    }

    [HttpPost("{id}/unarchive")]
    public async Task<IActionResult> UnarchiveBoard(Guid id)
    {
        var result = await _mediator.Send(new UnarchiveBoardCommand { Id = id });

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return NoContent();
    }

    // Board Members endpoints
    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetBoardMembers(Guid id)
    {
        var result = await _mediator.Send(new GetBoardMembersQuery { BoardId = id });

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return Ok(result);
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddBoardMember(Guid id, [FromBody] AddBoardMemberCommand command)
    {
        command.BoardId = id;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return NoContent();
    }

    [HttpDelete("{id}/members/{userId}")]
    public async Task<IActionResult> RemoveBoardMember(Guid id, string userId)
    {
        var result = await _mediator.Send(new RemoveBoardMemberCommand { BoardId = id, UserId = userId });

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return NoContent();
    }

    [HttpPut("{id}/members/{userId}/role")]
    public async Task<IActionResult> UpdateMemberRole(Guid id, string userId, [FromBody] UpdateMemberRoleCommand command)
    {
        command.BoardId = id;
        command.UserId = userId;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return NoContent();
    }

    // Board Columns endpoints
    [HttpPost("{id}/columns")]
    public async Task<IActionResult> CreateColumn(Guid id, [FromBody] CreateColumnCommand command)
    {
        command.BoardId = id;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return Ok(result);
    }

    [HttpPut("columns/{columnId}")]
    public async Task<IActionResult> UpdateColumn(Guid columnId, [FromBody] UpdateColumnCommand command)
    {
        command.Id = columnId;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return NoContent();
    }

    [HttpDelete("columns/{columnId}")]
    public async Task<IActionResult> DeleteColumn(Guid columnId)
    {
        var result = await _mediator.Send(new DeleteColumnCommand { Id = columnId });

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return NoContent();
    }

    [HttpPost("{id}/columns/reorder")]
    public async Task<IActionResult> ReorderColumns(Guid id, [FromBody] ReorderColumnsCommand command)
    {
        command.BoardId = id;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(Result.Failure(result.Errors));
        }

        return NoContent();
    }
}
