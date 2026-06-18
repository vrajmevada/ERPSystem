using ERPSystem.Domain.Entities.Inventory;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IMaterialInwardRepository
{
    Task<(List<MaterialInward> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<MaterialInward?> GetByIdAsync(int id);
    Task AddAsync(MaterialInward inward);
    Task UpdateAsync(MaterialInward inward);
    Task DeleteAsync(MaterialInward inward);
}
