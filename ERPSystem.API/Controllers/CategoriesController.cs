using ERPSystem.Application.Interfaces.Catalog;
using ERPSystem.Domain.Entities.Catalog;
using Microsoft.AspNetCore.Mvc;
using ERPSystem.Application.Features.Catalog.DTOs;
using ERPSystem.Application.Features.Catalog.Services;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _service;

    public CategoriesController(ICategoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _service.GetByIdAsync(id);

        if (category == null)
            return NotFound();

        var dto = new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
    [FromBody] CreateCategoryDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult>Update(
        int id, [FromBody] UpdateCategoryDto dto)
    {
        var updated = await _service.UpdateAsync(id,dto);
        if (!updated)
            return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult>Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}