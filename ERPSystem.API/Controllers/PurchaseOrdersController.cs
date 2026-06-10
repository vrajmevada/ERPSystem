using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Audit.Services;
using ERPSystem.Application.Features.Purchasing.DTOs;
using ERPSystem.Application.Features.Purchasing.Services;
using ERPSystem.Application.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IPurchaseOrderService _service;
    private readonly IAuditService _auditService;

    public PurchaseOrdersController(
    IPurchaseOrderService service,
    IAuditService auditService)
    {
        _service = service;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PurchaseOrderDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        return Ok(await _service.GetAllAsync(search, sortBy, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseOrderDto>>
        GetById(int id)
    {
        var order = await _service.GetByIdAsync(id);

        if (order == null)
            return NotFound();

        return Ok(order);
    }

    [HttpPost]
    [Authorize(Policy = AppPolicies.OrderOperate)]
    public async Task<ActionResult<PurchaseOrderDto>>
        Create(CreatePurchaseOrderDto dto)
    {
        var result = await _service.CreateAsync(dto);

        return Ok(result);
    }
    [HttpPost("{id}/receive")]
    [Authorize(Policy = AppPolicies.OrderOperate)]
    public async Task<IActionResult> Receive(int id)
    {
        await _service.ReceiveAsync(id);

        await _auditService.LogAsync(
            User.Identity?.Name ?? "Unknown",
            "Receive",
            "PurchaseOrder",
            id);
        return NoContent();
    }
    [HttpPost("{id}/approve")]
    [Authorize(Policy = AppPolicies.OrderApprove)]
    public async Task<IActionResult>
    Approve(int id)
    {
        await _service.ApproveAsync(id);

        await _auditService.LogAsync(
            User.Identity?.Name ?? "Unknown",
            "Approve",
            "PurchaseOrder",
            id);

        return NoContent();
    }

}