namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateMaterialInwardLineDto(
    int ProductId,
    int Quantity,
    string Remarks);
