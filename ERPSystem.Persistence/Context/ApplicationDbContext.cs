using ERPSystem.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Context;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext>options)
        :base(options)
    {
    }
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
}