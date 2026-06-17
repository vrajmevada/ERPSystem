using ERPSystem.Domain.Entities.Inventory;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IIndentRepository
{
    Task<(List<Indent> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<Indent?> GetByIdAsync(int id);

    Task AddAsync(Indent indent);

    Task UpdateAsync(Indent indent);

    Task DeleteAsync(Indent indent);
}