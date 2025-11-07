using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Auth.Queries.GetCurrentUser;

public class GetCurrentUserQuery : IRequest<Result<UserDto>>
{
}
