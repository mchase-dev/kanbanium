using FluentValidation;

namespace Kanbanium.Domain.Boards.Commands.UpdateBoard;

public class UpdateBoardCommandValidator : AbstractValidator<UpdateBoardCommand>
{
    public UpdateBoardCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Board ID is required");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Board name is required")
            .MaximumLength(100)
            .WithMessage("Board name must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.BackgroundColor)
            .Matches("^#[0-9A-Fa-f]{6}$")
            .When(x => !string.IsNullOrEmpty(x.BackgroundColor))
            .WithMessage("Background color must be a valid hex color (e.g., #FF5733)");
    }
}
