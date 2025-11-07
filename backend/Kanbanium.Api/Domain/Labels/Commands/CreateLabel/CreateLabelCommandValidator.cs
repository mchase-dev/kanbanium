using FluentValidation;

namespace Kanbanium.Domain.Labels.Commands.CreateLabel;

public class CreateLabelCommandValidator : AbstractValidator<CreateLabelCommand>
{
    public CreateLabelCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Label name is required")
            .MaximumLength(50).WithMessage("Label name must not exceed 50 characters");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Label color is required")
            .Matches("^#[0-9A-Fa-f]{6}$").WithMessage("Color must be a valid hex color (e.g., #FF5733)");

        RuleFor(x => x.BoardId)
            .NotEmpty().WithMessage("Board ID is required");
    }
}
