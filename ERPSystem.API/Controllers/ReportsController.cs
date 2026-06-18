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
    [HttpGet("inventory-summary")]
    public async Task<
    ActionResult<InventorySummaryDto>>
    GetInventorySummary()
    {
        return Ok(
            await _service
                .GetInventorySummaryAsync());
    }
    [HttpGet("sales-summary")]
    public async Task<
    ActionResult<SalesSummaryDto>>
    GetSalesSummary()
    {
        return Ok(
            await _service
                .GetSalesSummaryAsync());
    }
    [HttpGet("purchase-summary")]
    public async Task<
    ActionResult<PurchaseSummaryDto>>
    GetPurchaseSummary()
    {
        return Ok(
            await _service
                .GetPurchaseSummaryAsync());
    }

    [HttpGet("stock-report")]
    public async Task<IActionResult> GetStockReport([FromQuery] int? warehouseId, [FromQuery] int? productId)
    {
        return Ok(await _service.GetStockReportAsync(warehouseId, productId));
    }

    [HttpGet("stock-summary")]
    public async Task<IActionResult> GetStockSummary([FromQuery] int? productId)
    {
        return Ok(await _service.GetStockSummaryReportAsync(productId));
    }

    [HttpGet("tracking-detail")]
    public async Task<IActionResult> GetTrackingDetail([FromQuery] int? productId, [FromQuery] int? warehouseId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        return Ok(await _service.GetTrackingDetailReportAsync(productId, warehouseId, startDate, endDate));
    }
}