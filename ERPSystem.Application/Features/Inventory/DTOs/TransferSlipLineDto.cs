namespace ERPSystem.Application.Features.Inventory.DTOs;

public record TransferSlipLineDto(
    int Id,
    int TransferSlipId,
    int LineNo,
    int ProductId,
    string ProductName,
    int Quantity,
    int ShortClosedQuantity,
    string Notes);
