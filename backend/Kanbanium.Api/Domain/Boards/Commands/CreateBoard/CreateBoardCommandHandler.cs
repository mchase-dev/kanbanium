using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Kanbanium.Data.Entities;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Boards.Commands.CreateBoard;

public class CreateBoardCommandHandler : IRequestHandler<CreateBoardCommand, Result<BoardDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateBoardCommandHandler> _logger;

    public CreateBoardCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<CreateBoardCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<BoardDto>> Handle(CreateBoardCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || string.IsNullOrEmpty(_currentUserService.UserId))
        {
            return Result<BoardDto>.Failure("User is not authenticated");
        }

        // Create board
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description
        };

        _context.Boards.Add(board);

        // Add creator as Admin member
        var boardMember = new BoardMember
        {
            BoardId = board.Id,
            UserId = _currentUserService.UserId,
            Role = BoardRole.Admin
        };

        _context.BoardMembers.Add(boardMember);

        // Create default columns
        var defaultColumns = new[]
        {
            new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "To Do", Position = 0 },
            new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "In Progress", Position = 1 },
            new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "Done", Position = 2 }
        };

        _context.BoardColumns.AddRange(defaultColumns);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Board {BoardName} created by user {UserId}", request.Name, _currentUserService.UserId);

        // Load the board with related data
        var createdBoard = await _context.Boards
            .Include(b => b.Columns)
            .Include(b => b.Members)
                .ThenInclude(m => m.User)
            .FirstAsync(b => b.Id == board.Id, cancellationToken);

        var boardDto = createdBoard.Adapt<BoardDto>();

        return Result<BoardDto>.Success(boardDto);
    }
}
