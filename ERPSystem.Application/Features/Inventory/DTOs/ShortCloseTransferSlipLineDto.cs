namespace ERPSystem.Application.Features.Inventory.DTOs;

public record ShortCloseTransferSlipLineDto(
    int ProductId,
    int ShortCloseQuantity);
