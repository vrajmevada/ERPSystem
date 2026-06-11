using ERPSystem.Domain.Entities.Catalog;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Domain.Entities.People;
using ERPSystem.Domain.Entities.Purchasing;
using ERPSystem.Domain.Entities.Sales;
using ERPSystem.Domain.Entities.Identity;
using ERPSystem.Domain.Entities.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace ERPSystem.Persistence.Context;

public class ApplicationDbContext : DbContext
{
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IHttpContextAccessor? httpContextAccessor = null)
        : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<StockItem> StockItems => Set<StockItem>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderItem> SalesOrderItems => Set<SalesOrderItem>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<InventoryTransaction>()
            .Property(x => x.TransactionType)
            .HasConversion<string>();

        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var auditEntries = OnBeforeSaveChanges();
        var result = await base.SaveChangesAsync(cancellationToken);
        await OnAfterSaveChanges(auditEntries);
        return result;
    }

    private List<AuditEntry> OnBeforeSaveChanges()
    {
        ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntry>();

        var userName = _httpContextAccessor?.HttpContext?.User?.Identity?.Name ?? "System";

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditEntry(entry)
            {
                UserName = userName,
                EntityName = entry.Entity.GetType().Name,
                Action = entry.State == EntityState.Added ? "Create" : entry.State == EntityState.Deleted ? "Delete" : "Update"
            };

            auditEntries.Add(auditEntry);

            foreach (var property in entry.Properties)
            {
                string propertyName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[propertyName] = property.CurrentValue;
                    continue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                        break;

                    case EntityState.Deleted:
                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            var original = property.OriginalValue;
                            var current = property.CurrentValue;
                            if (original != null && current != null && !original.Equals(current))
                            {
                                auditEntry.OldValues[propertyName] = original;
                                auditEntry.NewValues[propertyName] = current;
                                auditEntry.ChangedValues[propertyName] = true;
                            }
                            else if (original == null && current != null)
                            {
                                auditEntry.OldValues[propertyName] = null;
                                auditEntry.NewValues[propertyName] = current;
                                auditEntry.ChangedValues[propertyName] = true;
                            }
                            else if (original != null && current == null)
                            {
                                auditEntry.OldValues[propertyName] = original;
                                auditEntry.NewValues[propertyName] = null;
                                auditEntry.ChangedValues[propertyName] = true;
                            }
                        }
                        break;
                }
            }
        }

        return auditEntries;
    }

    private async Task OnAfterSaveChanges(List<AuditEntry> auditEntries)
    {
        if (auditEntries == null || auditEntries.Count == 0)
            return;

        foreach (var auditEntry in auditEntries)
        {
            // Update the EntityId for added entities after SaveChanges
            if (auditEntry.Action == "Create")
            {
                foreach (var prop in auditEntry.Entry.Properties)
                {
                    if (prop.Metadata.IsPrimaryKey())
                    {
                        auditEntry.KeyValues[prop.Metadata.Name] = prop.CurrentValue;
                    }
                }
            }

            AuditLogs.Add(auditEntry.ToAuditLog());
        }

        await base.SaveChangesAsync();
    }
}

public class AuditEntry
{
    public AuditEntry(EntityEntry entry)
    {
        Entry = entry;
    }

    public EntityEntry Entry { get; }
    public string UserName { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public Dictionary<string, object?> KeyValues { get; } = new();
    public Dictionary<string, object?> OldValues { get; } = new();
    public Dictionary<string, object?> NewValues { get; } = new();
    public Dictionary<string, object?> ChangedValues { get; } = new();

    public AuditLog ToAuditLog()
    {
        var auditLog = new AuditLog
        {
            UserName = UserName,
            Action = Action,
            EntityName = EntityName,
            EntityId = KeyValues.Values.FirstOrDefault() is int id ? id : 0,
            Timestamp = DateTime.UtcNow
        };

        if (Action == "Create")
        {
            auditLog.Changes = JsonSerializer.Serialize(NewValues);
        }
        else if (Action == "Delete")
        {
            auditLog.Changes = JsonSerializer.Serialize(OldValues);
        }
        else if (Action == "Update")
        {
            var diff = new Dictionary<string, object>();
            foreach (var prop in ChangedValues.Keys)
            {
                diff[prop] = new { old = OldValues.ContainsKey(prop) ? OldValues[prop] : null, @new = NewValues.ContainsKey(prop) ? NewValues[prop] : null };
            }
            auditLog.Changes = JsonSerializer.Serialize(diff);
        }

        return auditLog;
    }
}