namespace ERPSystem.Application.Features.Inventory.DTOs;

public record MaterialOutwardLineDto(
    int Id,
    int LineNo,
    int ProductId,
    string ProductName,
    int Quantity,
    string Remarks);
