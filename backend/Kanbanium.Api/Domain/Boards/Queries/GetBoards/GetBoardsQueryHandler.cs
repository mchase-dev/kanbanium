using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Boards.Queries.GetBoards;

public class GetBoardsQueryHandler : IRequestHandler<GetBoardsQuery, Result<List<BoardListDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetBoardsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<List<BoardListDto>>> Handle(GetBoardsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || string.IsNullOrEmpty(_currentUserService.UserId))
        {
            return Result<List<BoardListDto>>.Failure("User is not authenticated");
        }

        // Get boards where user is a member
        var boards = await _context.Boards
            .Where(b => b.Members.Any(m => m.UserId == _currentUserService.UserId))
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BoardListDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                CreatedAt = b.CreatedAt,
                ColumnCount = b.Columns.Count,
                MemberCount = b.Members.Count,
                TaskCount = b.Tasks.Count
            })
            .ToListAsync(cancellationToken);

        return Result<List<BoardListDto>>.Success(boards);
    }
}
