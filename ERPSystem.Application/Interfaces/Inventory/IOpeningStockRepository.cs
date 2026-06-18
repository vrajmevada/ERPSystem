using ERPSystem.Domain.Entities.Inventory;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IOpeningStockRepository
{
    Task<(List<OpeningStock> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<OpeningStock?> GetByIdAsync(int id);
    Task AddAsync(OpeningStock openingStock);
    Task UpdateAsync(OpeningStock openingStock);
    Task DeleteAsync(OpeningStock openingStock);
}
