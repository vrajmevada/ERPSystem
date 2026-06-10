using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Features.Inventory.Services;
using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;
using ERPSystem.Application.Security;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockItemsController : ControllerBase
{
    private readonly IStockItemService _service;

    public StockItemsController(IStockItemService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<StockItemDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        return Ok(await _service.GetAllAsync(search, sortBy, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StockItemDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);

        if (item == null)
            return NotFound();

        return Ok(item);
    }

    [HttpPost]
    [Authorize(Policy = AppPolicies.MasterDataWrite)]
    public async Task<ActionResult<StockItemDto>> Create(
        CreateStockItemDto dto)
    {
        var result = await _service.CreateAsync(dto);

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = AppPolicies.MasterDataWrite)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}