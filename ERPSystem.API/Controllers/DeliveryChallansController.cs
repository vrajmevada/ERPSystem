using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Features.Inventory.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeliveryChallansController : ControllerBase
{
    private readonly IDeliveryChallanService _service;

    public DeliveryChallansController(IDeliveryChallanService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var result = await _service.GetAllAsync(search, sortBy, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDeliveryChallanDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}/ship")]
    public async Task<IActionResult> Ship(int id)
    {
        await _service.ShipAsync(id);
        return NoContent();
    }

    [HttpPut("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        await _service.CancelAsync(id);
        return NoContent();
    }
}
