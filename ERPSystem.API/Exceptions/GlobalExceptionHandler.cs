using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ERPSystem.Application.Exceptions;
namespace ERPSystem.API.Exceptions;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
    HttpContext httpContext,
    Exception exception,
    CancellationToken cancellationToken)
    {
        var statusCode = StatusCodes.Status500InternalServerError;
        var title = "Internal Server Error";
        var detail = "An unexpected error occurred.";

        if (exception is BusinessException)
        {
            statusCode = StatusCodes.Status400BadRequest;
            title = "Business Rule Violation";
            detail = exception.Message;
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message
        };

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken);

        return true;
    }
}