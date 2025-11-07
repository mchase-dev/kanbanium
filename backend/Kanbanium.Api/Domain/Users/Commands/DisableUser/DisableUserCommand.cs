using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Users.Commands.DisableUser;

public record DisableUserCommand(string UserId) : IRequest<Result>;
