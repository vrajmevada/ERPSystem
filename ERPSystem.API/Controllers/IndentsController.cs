using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Features.Inventory.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IndentsController : ControllerBase
{
    private readonly IIndentService _indentService;

    public IndentsController(IIndentService indentService)
    {
        _indentService = indentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var result = await _indentService.GetAllAsync(search, sortBy, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _indentService.GetByIdAsync(id);
        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateIndentDto dto)
    {
        var result = await _indentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        await _indentService.ApproveAsync(id);
        return NoContent();
    }

    [HttpPut("{id:int}/disapprove")]
    public async Task<IActionResult> Disapprove(int id)
    {
        await _indentService.DisapproveAsync(id);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _indentService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPut("{id:int}/short-close")]
    public async Task<IActionResult> ShortClose(int id, [FromBody] ShortCloseIndentDto dto)
    {
        await _indentService.ShortCloseAsync(id, dto);
        return NoContent();
    }
}