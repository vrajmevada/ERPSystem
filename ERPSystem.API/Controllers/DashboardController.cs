using ERPSystem.Application.Features.Dashboard.DTOs;
using ERPSystem.Application.Features.Dashboard.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(
        IDashboardService service)
    {
        _service = service;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>>
        GetSummary()
    {
        return Ok(
            await _service.GetSummaryAsync());
    }
}