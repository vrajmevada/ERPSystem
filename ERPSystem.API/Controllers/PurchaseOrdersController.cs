using ERPSystem.Application.Features.Purchasing.DTOs;
using ERPSystem.Application.Features.Purchasing.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IPurchaseOrderService _service;

    public PurchaseOrdersController(
        IPurchaseOrderService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseOrderDto>>>
        GetAll()
    {
        return Ok(await _service.GetAllAsync());
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
    public async Task<ActionResult<PurchaseOrderDto>>
        Create(CreatePurchaseOrderDto dto)
    {
        var result = await _service.CreateAsync(dto);

        return Ok(result);
    }
    [HttpPost("{id}/receive")]
    public async Task<IActionResult> Receive(int id)
    {
        await _service.ReceiveAsync(id);

        return NoContent();
    }
}