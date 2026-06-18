using ERPSystem.Domain.Entities.Inventory;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IMaterialOutwardRepository
{
    Task<(List<MaterialOutward> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<MaterialOutward?> GetByIdAsync(int id);
    Task AddAsync(MaterialOutward outward);
    Task UpdateAsync(MaterialOutward outward);
    Task DeleteAsync(MaterialOutward outward);
}
