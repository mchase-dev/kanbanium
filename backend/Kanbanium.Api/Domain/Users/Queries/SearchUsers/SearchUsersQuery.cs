using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Users.Queries.SearchUsers;

public record SearchUsersQuery(string? SearchTerm = null) : IRequest<Result<List<UserDto>>>;
