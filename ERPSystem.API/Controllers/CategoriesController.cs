using ERPSystem.Application.Interfaces.Catalog;
using ERPSystem.Domain.Entities.Catalog;
using Microsoft.AspNetCore.Mvc;
using ERPSystem.Application.Features.Catalog.DTOs;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _repository;

    public CategoriesController(ICategoryRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _repository.GetAllAsync();

        var result = categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _repository.GetByIdAsync(id);

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
        var category = new Category
        {
            Name = dto.Name
        };

        await _repository.AddAsync(category);

        return Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult>Update(
        int id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null)
            return NotFound();

        category.Name = dto.Name;
        await _repository.UpdateAsync(category);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult>Delete(int id)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null)
            return NotFound();

        await _repository.DeleteAsync(category);
        return NoContent();
    }
}