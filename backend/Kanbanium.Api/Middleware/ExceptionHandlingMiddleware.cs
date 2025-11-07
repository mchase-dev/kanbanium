using System.Net;
using System.Text.Json;
using FluentValidation;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            ApiException apiEx => (apiEx.StatusCode, apiEx.Message),
            ValidationException validationEx => (
                StatusCodes.Status422UnprocessableEntity,
                FormatValidationErrors(validationEx)
            ),
            DbUpdateConcurrencyException => (
                StatusCodes.Status409Conflict,
                "A concurrency conflict occurred. The resource may have been modified by another user."
            ),
            DbUpdateException dbEx when dbEx.InnerException?.Message.Contains("duplicate", StringComparison.OrdinalIgnoreCase) == true ||
                                        dbEx.InnerException?.Message.Contains("unique constraint", StringComparison.OrdinalIgnoreCase) == true => (
                StatusCodes.Status409Conflict,
                "A conflict occurred. The resource may already exist or violates a unique constraint."
            ),
            DbUpdateException => (
                StatusCodes.Status500InternalServerError,
                "A database error occurred while processing your request."
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                "An unexpected error occurred. Please try again later."
            )
        };

        // Log the exception with appropriate level
        LogException(exception, statusCode, context);

        // Prepare error response
        var errorResponse = new ErrorResponse(message, statusCode);
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse, options));
    }

    private void LogException(Exception exception, int statusCode, HttpContext context)
    {
        var logMessage = $"Request {context.Request.Method} {context.Request.Path} failed with status {statusCode}";

        if (statusCode >= 500)
        {
            _logger.LogError(exception, "{LogMessage}", logMessage);
        }
        else if (statusCode >= 400)
        {
            _logger.LogWarning(exception, "{LogMessage}", logMessage);
        }
    }

    private static string FormatValidationErrors(ValidationException validationException)
    {
        var errors = validationException.Errors
            .Select(e => $"{e.PropertyName}: {e.ErrorMessage}")
            .ToList();

        return errors.Count == 1
            ? errors[0]
            : $"Validation failed: {string.Join("; ", errors)}";
    }
}
