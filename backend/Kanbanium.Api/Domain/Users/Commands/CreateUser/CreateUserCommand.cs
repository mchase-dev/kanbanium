using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Users.Commands.CreateUser;

public record CreateUserCommand(
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    string Password,
    string Role
) : IRequest<Result<UserDto>>;
