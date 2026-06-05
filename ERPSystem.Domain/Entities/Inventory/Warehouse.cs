namespace ERPSystem.Domain.Entities.Inventory;

public class Warehouse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;
}