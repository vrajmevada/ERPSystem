using ERPSystem.Domain.Entities.Inventory;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface ITransferSlipRepository
{
    Task<(List<TransferSlip> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<TransferSlip?> GetByIdAsync(int id);
    Task AddAsync(TransferSlip transferSlip);
    Task UpdateAsync(TransferSlip transferSlip);
    Task DeleteAsync(TransferSlip transferSlip);
}
