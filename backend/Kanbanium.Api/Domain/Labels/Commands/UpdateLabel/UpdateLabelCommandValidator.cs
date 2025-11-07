using FluentValidation;

namespace Kanbanium.Domain.Labels.Commands.UpdateLabel;

public class UpdateLabelCommandValidator : AbstractValidator<UpdateLabelCommand>
{
    public UpdateLabelCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Label ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Label name is required")
            .MaximumLength(50).WithMessage("Label name must not exceed 50 characters");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Label color is required")
            .Matches("^#[0-9A-Fa-f]{6}$").WithMessage("Color must be a valid hex color (e.g., #FF5733)");
    }
}
