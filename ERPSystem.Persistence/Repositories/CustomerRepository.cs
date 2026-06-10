using ERPSystem.Application.Interfaces.People;
using ERPSystem.Domain.Entities.People;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly ApplicationDbContext _context;

    public CustomerRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<Customer> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<Customer> query = _context.Customers;

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Name.Contains(search) || c.Email.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "name" => query.OrderBy(c => c.Name),
            "email" => query.OrderBy(c => c.Email),
            _ => query.OrderBy(c => c.Id)
        };

        int totalCount = await query.CountAsync();

        if (page.HasValue && pageSize.HasValue)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var items = await query.ToListAsync();
        return (items, totalCount);
    }

    public async Task<Customer?> GetByIdAsync(int id)
    {
        return await _context.Customers.FindAsync(id);
    }

    public async Task AddAsync(Customer customer)
    {
        await _context.Customers.AddAsync(customer);

        await _context.SaveChangesAsync();
    }
    public async Task UpdateAsync(Customer customer)
    {
        _context.Customers.Update(customer);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Customer customer)
    {
        _context.Customers.Remove(customer);

        await _context.SaveChangesAsync();
    }
}