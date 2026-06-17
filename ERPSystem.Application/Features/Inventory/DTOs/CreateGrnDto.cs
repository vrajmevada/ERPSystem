namespace ERPSystem.Application.Features.Inventory.DTOs;
public record CreateGrnDto(
    int PurchaseOrderId,
    string Remarks,
    List<CreateGrnLineDto> Lines);
