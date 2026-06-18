namespace ERPSystem.Application.Features.Inventory.DTOs;

public record MaterialInwardLineDto(
    int Id,
    int LineNo,
    int ProductId,
    string ProductName,
    int Quantity,
    string Remarks);
