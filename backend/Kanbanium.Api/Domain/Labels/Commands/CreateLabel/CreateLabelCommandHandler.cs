using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Labels.Commands.CreateLabel;

public class CreateLabelCommandHandler : IRequestHandler<CreateLabelCommand, Result<LabelDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateLabelCommandHandler> _logger;

    public CreateLabelCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<CreateLabelCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<LabelDto>> Handle(CreateLabelCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var board = await _context.Boards
            .Include(b => b.Members)
            .FirstOrDefaultAsync(b => b.Id == request.BoardId, cancellationToken);

        if (board == null)
        {
            throw new NotFoundException(nameof(Board), request.BoardId);
        }

        // Verify user is a board admin
        var member = board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            _logger.LogWarning("User {UserId} attempted to create label on board {BoardId} without membership", userId, request.BoardId);
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role != BoardRole.Admin)
        {
            throw new ForbiddenException("Only board admins can create labels");
        }

        var label = new Label
        {
            BoardId = request.BoardId,
            Name = request.Name,
            Color = request.Color
        };

        _context.Labels.Add(label);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} created label {LabelId} on board {BoardId}", userId, label.Id, request.BoardId);

        var labelDto = label.Adapt<LabelDto>();
        return Result<LabelDto>.Success(labelDto);
    }
}
