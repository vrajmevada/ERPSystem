using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Features.Inventory.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryTransactionsController : ControllerBase
{
    private readonly IInventoryTransactionService _service;

    public InventoryTransactionsController(
        IInventoryTransactionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryTransactionDto>>>
        GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryTransactionDto>>
        GetById(int id)
    {
        var transaction =
            await _service.GetByIdAsync(id);

        if (transaction == null)
            return NotFound();

        return Ok(transaction);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryTransactionDto>>
        Create(CreateInventoryTransactionDto dto)
    {
        var result =
            await _service.CreateAsync(dto);

        return Ok(result);
    }
}