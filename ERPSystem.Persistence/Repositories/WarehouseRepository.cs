using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class WarehouseRepository : IWarehouseRepository
{
    private readonly ApplicationDbContext _context;

    public WarehouseRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Warehouse>> GetAllAsync()
    {
        return await _context.Warehouses.ToListAsync();
    }

    public async Task<Warehouse?> GetByIdAsync(int id)
    {
        return await _context.Warehouses.FindAsync(id);
    }

    public async Task AddAsync(Warehouse warehouse)
    {
        await _context.Warehouses.AddAsync(warehouse);

        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Warehouse warehouse)
    {
        _context.Warehouses.Update(warehouse);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Warehouse warehouse)
    {
        _context.Warehouses.Remove(warehouse);

        await _context.SaveChangesAsync();
    }
}