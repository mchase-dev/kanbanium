using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    string UserId,
    string? FirstName = null,
    string? LastName = null,
    string? Email = null,
    string? Role = null
) : IRequest<Result<UserDto>>;
