using ERPSystem.Application.Features.Catalog.DTOs;
using ERPSystem.Application.Interfaces.Catalog;
using ERPSystem.Domain.Entities.Catalog;
using Mapster;
namespace ERPSystem.Application.Features.Catalog.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }
    public async Task<IEnumerable<CategoryDto>>GetAllAsync()
    {
        var categories = await _repository.GetAllAsync();
        return categories.Adapt<List<CategoryDto>>();

    }
    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null)
            return null;

        return category.Adapt<CategoryDto>();
    }
    public async Task<CategoryDto> CreateAsync(
        CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
        };
        await _repository.AddAsync(category);
        return category.Adapt<CategoryDto>();
    }
    public async Task<bool> UpdateAsync(
        int id,
        UpdateCategoryDto dto)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null)
            return false;
        category.Name = dto.Name;
        await _repository.UpdateAsync(category);
        return true;
    }
    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null)
            return false;
        await _repository.DeleteAsync(category);
        return true;
    }
}