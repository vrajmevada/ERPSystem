using ERPSystem.Application.Features.Sales.DTOs;
using ERPSystem.Application.Features.Sales.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesOrdersController : ControllerBase
{
    private readonly ISalesOrderService _service;

    public SalesOrdersController(
        ISalesOrderService service)
    {
        _service = service;
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
    public async Task<ActionResult<SalesOrderDto>>
        Create(CreateSalesOrderDto dto)
    {
        var result = await _service.CreateAsync(dto);

        return Ok(result);
    }

    [HttpPost("{id}/ship")]
    public async Task<IActionResult> Ship(int id)
    {
        await _service.ShipAsync(id);

        return NoContent();
    }
    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(int id)
    {
        await _service.ConfirmAsync(id);

        return NoContent();
    }
}