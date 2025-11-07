using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Labels.Commands.UpdateLabel;

public class UpdateLabelCommandHandler : IRequestHandler<UpdateLabelCommand, Result<LabelDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateLabelCommandHandler> _logger;

    public UpdateLabelCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateLabelCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<LabelDto>> Handle(UpdateLabelCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var label = await _context.Labels
            .Include(l => l.Board)
                .ThenInclude(b => b!.Members)
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
            _logger.LogWarning("User {UserId} attempted to update label {LabelId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role != BoardRole.Admin)
        {
            throw new ForbiddenException("Only board admins can update labels");
        }

        label.Name = request.Name;
        label.Color = request.Color;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated label {LabelId}", userId, label.Id);

        var labelDto = label.Adapt<LabelDto>();
        return Result<LabelDto>.Success(labelDto);
    }
}
