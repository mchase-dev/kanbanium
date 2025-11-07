using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.SubTasks.Commands.DeleteSubTask;

public class DeleteSubTaskCommandHandler : IRequestHandler<DeleteSubTaskCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeleteSubTaskCommandHandler> _logger;

    public DeleteSubTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DeleteSubTaskCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteSubTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var subTask = await _context.SubTasks
            .Include(st => st.Task)
                .ThenInclude(t => t.Board)
                    .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(st => st.Id == request.Id, cancellationToken);

        if (subTask == null)
        {
            throw new NotFoundException(nameof(SubTask), request.Id);
        }

        // Verify user is a board member
        var isMember = subTask.Task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to delete subtask {SubTaskId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        _context.SubTasks.Remove(subTask);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} deleted subtask {SubTaskId}", userId, request.Id);

        return Result.Success();
    }
}
