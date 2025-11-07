using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Labels.Commands.DeleteLabel;

public class DeleteLabelCommandHandler : IRequestHandler<DeleteLabelCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeleteLabelCommandHandler> _logger;

    public DeleteLabelCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DeleteLabelCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteLabelCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var label = await _context.Labels
            .Include(l => l.Board)
                .ThenInclude(b => b!.Members)
            .Include(l => l.TaskLabels)
            .FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken);

        if (label == null)
        {
            throw new NotFoundException(nameof(Label), request.Id);
        }

        if (label.Board == null)
        {
            throw new NotFoundException(nameof(Board), label.BoardId);
        }

        // Verify user is a board admin
        var member = label.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            _logger.LogWarning("User {UserId} attempted to delete label {LabelId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role != BoardRole.Admin)
        {
            throw new ForbiddenException("Only board admins can delete labels");
        }

        // Remove all task label associations
        _context.TaskLabels.RemoveRange(label.TaskLabels);

        _context.Labels.Remove(label);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} deleted label {LabelId}", userId, request.Id);

        return Result.Success();
    }
}
