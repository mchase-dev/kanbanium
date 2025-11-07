using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Sprints.Commands.DeleteSprint;

public class DeleteSprintCommandHandler : IRequestHandler<DeleteSprintCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeleteSprintCommandHandler> _logger;

    public DeleteSprintCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DeleteSprintCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteSprintCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var sprint = await _context.Sprints
            .Include(s => s.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (sprint == null)
        {
            throw new NotFoundException(nameof(Sprint), request.Id);
        }

        // Verify user is a board admin
        var member = sprint.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            _logger.LogWarning("User {UserId} attempted to delete sprint {SprintId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role != BoardRole.Admin)
        {
            throw new ForbiddenException("Only board admins can delete sprints");
        }

        // Remove sprint association from tasks
        var tasksInSprint = await _context.TaskItems
            .Where(t => t.SprintId == request.Id)
            .ToListAsync(cancellationToken);

        foreach (var task in tasksInSprint)
        {
            task.SprintId = null;
        }

        // Soft delete
        _context.Sprints.Remove(sprint);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} deleted sprint {SprintId}", userId, request.Id);

        return Result.Success();
    }
}
