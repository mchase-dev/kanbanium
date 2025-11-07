using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Sprints.Commands.StartSprint;

public class StartSprintCommandHandler : IRequestHandler<StartSprintCommand, Result<SprintDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<StartSprintCommandHandler> _logger;

    public StartSprintCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<StartSprintCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SprintDto>> Handle(StartSprintCommand request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to start sprint {SprintId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role != BoardRole.Admin)
        {
            throw new ForbiddenException("Only board admins can start sprints");
        }

        if (sprint.Status != SprintStatus.Planned)
        {
            throw new BadRequestException($"Cannot start a sprint that is already {sprint.Status}");
        }

        // Check if there's already an active sprint on this board
        var hasActiveSprint = await _context.Sprints
            .AnyAsync(s => s.BoardId == sprint.BoardId && s.Status == SprintStatus.Active && s.Id != sprint.Id, cancellationToken);

        if (hasActiveSprint)
        {
            throw new BadRequestException("There is already an active sprint on this board");
        }

        sprint.Status = SprintStatus.Active;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} started sprint {SprintId}", userId, request.Id);

        var sprintDto = sprint.Adapt<SprintDto>();
        sprintDto.TaskCount = await _context.TaskItems.CountAsync(t => t.SprintId == sprint.Id, cancellationToken);

        return Result<SprintDto>.Success(sprintDto);
    }
}
