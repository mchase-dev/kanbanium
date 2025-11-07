using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Users.Commands.EnableUser;

public record EnableUserCommand(string UserId) : IRequest<Result>;
