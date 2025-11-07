using Kanbanium.Data.Entities;
using Kanbanium.Domain.Tasks.Commands.ArchiveTask;
using Kanbanium.Domain.Tasks.Commands.AssignTask;
using Kanbanium.Domain.Tasks.Commands.CreateTask;
using Kanbanium.Domain.Tasks.Commands.DeleteTask;
using Kanbanium.Domain.Tasks.Commands.MoveTask;
using Kanbanium.Domain.Tasks.Commands.UnarchiveTask;
using Kanbanium.Domain.Tasks.Commands.UpdateTask;
using Kanbanium.Domain.Tasks.Queries.GetTaskById;
using Kanbanium.Domain.Tasks.Queries.GetTasksByBoard;
using Kanbanium.Domain.Tasks.Queries.GetTasksByColumn;
using Kanbanium.Domain.Tasks.Queries.GetTaskHistory;
using Kanbanium.Domain.Tasks.Queries.GetMyTasks;
using Kanbanium.Domain.Tasks.Queries.SearchTasks;
using Kanbanium.Domain.Watchers.Commands.AddWatcher;
using Kanbanium.Domain.Watchers.Commands.RemoveWatcher;
using Kanbanium.Domain.Watchers.Queries.GetWatchers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kanbanium.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;

    public TasksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all tasks for a specific board
    /// </summary>
    [HttpGet("board/{boardId}")]
    public async Task<IActionResult> GetTasksByBoard(Guid boardId)
    {
        var query = new GetTasksByBoardQuery { BoardId = boardId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get a specific task by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTaskById(Guid id)
    {
        var query = new GetTaskByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Create a new task
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetTaskById), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Update an existing task
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskCommand command)
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
    /// Delete a task
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var command = new DeleteTaskCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Move a task to a different column and/or position
    /// </summary>
    [HttpPost("{id}/move")]
    public async Task<IActionResult> MoveTask(Guid id, [FromBody] MoveTaskCommand command)
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
    /// Archive a task
    /// </summary>
    [HttpPost("{id}/archive")]
    public async Task<IActionResult> ArchiveTask(Guid id)
    {
        var command = new ArchiveTaskCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Unarchive a task
    /// </summary>
    [HttpPost("{id}/unarchive")]
    public async Task<IActionResult> UnarchiveTask(Guid id)
    {
        var command = new UnarchiveTaskCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Assign or unassign a task to/from a user
    /// </summary>
    [HttpPost("{id}/assign")]
    public async Task<IActionResult> AssignTask(Guid id, [FromBody] AssignTaskCommand command)
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
    /// Get all tasks in a specific column
    /// </summary>
    [HttpGet("column/{columnId}")]
    public async Task<IActionResult> GetTasksByColumn(Guid columnId)
    {
        var query = new GetTasksByColumnQuery { ColumnId = columnId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Search and filter tasks within a board
    /// </summary>
    [HttpGet("board/{boardId}/search")]
    public async Task<IActionResult> SearchTasks(
        Guid boardId,
        [FromQuery] string? searchTerm = null,
        [FromQuery] Guid? statusId = null,
        [FromQuery] Guid? typeId = null,
        [FromQuery] string? assigneeId = null,
        [FromQuery] Priority? priority = null,
        [FromQuery] Guid? sprintId = null,
        [FromQuery] bool? isArchived = null,
        [FromQuery] Guid? labelId = null)
    {
        var query = new SearchTasksQuery
        {
            BoardId = boardId,
            SearchTerm = searchTerm,
            StatusId = statusId,
            TypeId = typeId,
            AssigneeId = assigneeId,
            Priority = priority,
            SprintId = sprintId,
            IsArchived = isArchived,
            LabelId = labelId
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get all tasks assigned to the current user across all boards
    /// </summary>
    [HttpGet("my-tasks")]
    public async Task<IActionResult> GetMyTasks(
        [FromQuery] string? boardId = null,
        [FromQuery] string? statusId = null,
        [FromQuery] int? priority = null,
        [FromQuery] bool? isOverdue = null,
        [FromQuery] string? sortBy = "DueDate")
    {
        var query = new GetMyTasksQuery
        {
            BoardId = boardId,
            StatusId = statusId,
            Priority = priority,
            IsOverdue = isOverdue,
            SortBy = sortBy
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get activity history for a specific task
    /// </summary>
    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetTaskHistory(Guid id)
    {
        var query = new GetTaskHistoryQuery { TaskId = id };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get watchers for a specific task
    /// </summary>
    [HttpGet("{id}/watchers")]
    public async Task<IActionResult> GetWatchers(Guid id)
    {
        var query = new GetWatchersQuery { TaskId = id };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Add current user as watcher to a task
    /// </summary>
    [HttpPost("{id}/watch")]
    public async Task<IActionResult> AddWatcher(Guid id)
    {
        var command = new AddWatcherCommand { TaskId = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Remove current user as watcher from a task
    /// </summary>
    [HttpDelete("{id}/watch")]
    public async Task<IActionResult> RemoveWatcher(Guid id)
    {
        var command = new RemoveWatcherCommand { TaskId = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
