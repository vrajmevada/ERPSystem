using ERPSystem.Domain.Entities.Inventory;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IStockConvertRepository
{
    Task<(List<StockConvert> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<StockConvert?> GetByIdAsync(int id);
    Task AddAsync(StockConvert stockConvert);
    Task UpdateAsync(StockConvert stockConvert);
    Task DeleteAsync(StockConvert stockConvert);
}
