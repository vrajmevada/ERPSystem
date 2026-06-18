namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateTransferSlipLineDto(
    int ProductId,
    int Quantity,
    string Notes);
