using ERPSystem.Application.Features.Audit.Services;
using ERPSystem.Application.Features.Purchasing.Services;
using ERPSystem.Application.Features.Sales.DTOs;
using ERPSystem.Application.Features.Sales.Services;
using ERPSystem.Application.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalesOrdersController : ControllerBase
{
    private readonly ISalesOrderService _service;
    private readonly IAuditService _auditService;

    public SalesOrdersController(
    ISalesOrderService service,
    IAuditService auditService)
    {
        _service = service;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesOrderDto>>>
        GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SalesOrderDto>>
        GetById(int id)
    {
        var order = await _service.GetByIdAsync(id);

        if (order == null)
            return NotFound();

        return Ok(order);
    }

    [HttpPost]
    [Authorize(Policy = AppPolicies.OrderOperate)]
    public async Task<ActionResult<SalesOrderDto>>
        Create(CreateSalesOrderDto dto)
    {
        var result = await _service.CreateAsync(dto);

        return Ok(result);
    }

    [HttpPost("{id}/ship")]
    [Authorize(Policy = AppPolicies.OrderOperate)]
    public async Task<IActionResult> Ship(int id)
    {
        await _service.ShipAsync(id);
        await _auditService.LogAsync(
            User.Identity?.Name ?? "Unknown",
            "Ship",
            "SalesOrder",
            id);

        return NoContent();
    }
    [HttpPost("{id}/confirm")]
    [Authorize(Policy = AppPolicies.OrderOperate)]
    public async Task<IActionResult> Confirm(int id)
    {
        await _service.ConfirmAsync(id);

        await _auditService.LogAsync(
            User.Identity?.Name ?? "Unknown",
            "Confirm",
            "SalesOrder",
            id);
        return NoContent();
    }
}