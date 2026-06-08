using ERPSystem.Domain.Entities.Catalog;
using ERPSystem.Domain.Entities.People;
using ERPSystem.Domain.Entities.Inventory;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Context;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<StockItem> StockItems => Set<StockItem>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<InventoryTransaction>()
            .Property(x => x.TransactionType)
            .HasConversion<string>();

        base.OnModelCreating(modelBuilder);
    }
}