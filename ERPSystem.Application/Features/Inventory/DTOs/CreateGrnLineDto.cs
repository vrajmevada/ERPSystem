namespace ERPSystem.Application.Features.Inventory.DTOs;
public record CreateGrnLineDto(
    int ProductId,
    int OrderedQuantity,
    int ReceivedQuantity);
