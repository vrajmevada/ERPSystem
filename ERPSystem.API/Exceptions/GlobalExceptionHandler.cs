using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Exceptions;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Internal Server Error",
            Detail = "An unexpected error occurred."
        };
        httpContext.Response.StatusCode = 500;
        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken);
        return true;
    }
}