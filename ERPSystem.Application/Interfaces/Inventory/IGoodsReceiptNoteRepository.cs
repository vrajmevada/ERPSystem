using ERPSystem.Domain.Entities.Inventory;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IGoodsReceiptNoteRepository
{
    Task<(List<GoodsReceiptNote> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        int? page = null,
        int? pageSize = null);

    Task<GoodsReceiptNote?> GetByIdAsync(int id);
    Task AddAsync(GoodsReceiptNote grn);
    Task UpdateAsync(GoodsReceiptNote grn);
}