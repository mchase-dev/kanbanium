using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.SubTasks.Commands.CreateSubTask;

public class CreateSubTaskCommandHandler : IRequestHandler<CreateSubTaskCommand, Result<SubTaskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateSubTaskCommandHandler> _logger;

    public CreateSubTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<CreateSubTaskCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SubTaskDto>> Handle(CreateSubTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.TaskItems
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.TaskId);
        }

        // Verify user is a board member
        var isMember = task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to add subtask to task {TaskId} without board membership", userId, request.TaskId);
            throw new ForbiddenException("You do not have access to this board");
        }

        // Calculate position
        var maxPosition = task.SubTasks.Any() ? task.SubTasks.Max(st => st.Position) : -1;

        var subTask = new SubTask
        {
            TaskId = request.TaskId,
            Title = request.Title,
            IsCompleted = false,
            Position = maxPosition + 1
        };

        _context.SubTasks.Add(subTask);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} created subtask {SubTaskId} on task {TaskId}", userId, subTask.Id, request.TaskId);

        var subTaskDto = subTask.Adapt<SubTaskDto>();
        return Result<SubTaskDto>.Success(subTaskDto);
    }
}
