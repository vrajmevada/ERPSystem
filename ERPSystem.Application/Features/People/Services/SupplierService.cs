using ERPSystem.Application.Features.People.DTOs;
using ERPSystem.Application.Interfaces.People;
using ERPSystem.Domain.Entities.People;
using Mapster;

namespace ERPSystem.Application.Features.People.Services;

public class SupplierService : ISupplierService
{
    private readonly ISupplierRepository _repository;

    public SupplierService(ISupplierRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<SupplierDto>> GetAllAsync()
    {
        var suppliers = await _repository.GetAllAsync();

        return suppliers.Adapt<List<SupplierDto>>();
    }

    public async Task<SupplierDto?> GetByIdAsync(int id)
    {
        var supplier = await _repository.GetByIdAsync(id);

        if (supplier == null)
            return null;

        return supplier.Adapt<SupplierDto>();
    }

    public async Task<SupplierDto> CreateAsync(
        CreateSupplierDto dto)
    {
        var supplier = dto.Adapt<Supplier>();

        await _repository.AddAsync(supplier);

        return supplier.Adapt<SupplierDto>();
    }

    public async Task<bool> UpdateAsync(
        int id,
        UpdateSupplierDto dto)
    {
        var supplier = await _repository.GetByIdAsync(id);

        if (supplier == null)
            return false;

        supplier.Name = dto.Name;
        supplier.Email = dto.Email;
        supplier.Phone = dto.Phone;
        supplier.Address = dto.Address;

        await _repository.UpdateAsync(supplier);

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var supplier = await _repository.GetByIdAsync(id);

        if (supplier == null)
            return false;

        await _repository.DeleteAsync(supplier);

        return true;
    }
}