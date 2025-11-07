using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Users.Queries.GetAllUsers;

public record GetAllUsersQuery(
    string? SearchTerm = null,
    string? Role = null,
    bool? IncludeDeleted = false,
    int Page = 1,
    int PageSize = 20
) : IRequest<Result<PaginatedList<UserDto>>>;
