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
}