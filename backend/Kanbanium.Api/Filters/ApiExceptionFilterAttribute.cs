using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Kanbanium.Filters;

public class ApiExceptionFilterAttribute : ExceptionFilterAttribute
{
    private readonly ILogger<ApiExceptionFilterAttribute> _logger;

    public ApiExceptionFilterAttribute(ILogger<ApiExceptionFilterAttribute> logger)
    {
        _logger = logger;
    }

    public override void OnException(ExceptionContext context)
    {
        if (context.Exception is ApiException apiException)
        {
            var errorResponse = new ErrorResponse(
                apiException.Message,
                apiException.StatusCode
            );

            context.Result = new ObjectResult(errorResponse)
            {
                StatusCode = apiException.StatusCode
            };

            _logger.LogWarning(
                apiException,
                "API exception occurred in {Controller}.{Action}: {Message}",
                context.RouteData.Values["controller"],
                context.RouteData.Values["action"],
                apiException.Message
            );

            context.ExceptionHandled = true;
        }

        base.OnException(context);
    }
}
