using FluentValidation;

namespace Kanbanium.Domain.Auth.Commands.RefreshToken;

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .WithMessage("Refresh token is required")
            .MinimumLength(32)
            .WithMessage("Invalid refresh token format")
            .MaximumLength(500)
            .WithMessage("Refresh token must not exceed 500 characters");
    }
}
