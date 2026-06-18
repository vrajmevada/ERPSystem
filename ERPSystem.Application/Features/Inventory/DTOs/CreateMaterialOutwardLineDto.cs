namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateMaterialOutwardLineDto(
    int ProductId,
    int Quantity,
    string Remarks);
