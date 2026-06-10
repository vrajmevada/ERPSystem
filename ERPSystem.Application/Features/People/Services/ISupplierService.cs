using ERPSystem.Application.Common;
using ERPSystem.Application.Features.People.DTOs;

namespace ERPSystem.Application.Features.People.Services;

public interface ISupplierService
{
    Task<PagedResult<SupplierDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<SupplierDto?> GetByIdAsync(int id);

    Task<SupplierDto> CreateAsync(CreateSupplierDto dto);

    Task<bool> UpdateAsync(
        int id,
        UpdateSupplierDto dto);

    Task<bool> DeleteAsync(int id);
}