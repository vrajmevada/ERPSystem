using ERPSystem.Application.Features.Reports.DTOs;
using ERPSystem.Application.Features.Reports.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _service;

    public ReportsController(
        IReportService service)
    {
        _service = service;
    }

    [HttpGet("low-stock")]
    public async Task<
        ActionResult<IEnumerable<LowStockReportDto>>>
        GetLowStock()
    {
        return Ok(
            await _service.GetLowStockItemsAsync());
    }
}