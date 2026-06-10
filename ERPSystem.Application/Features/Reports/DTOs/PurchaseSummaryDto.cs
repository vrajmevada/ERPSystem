namespace ERPSystem.Application.Features.Reports.DTOs;

public record PurchaseSummaryDto(
    int TotalOrders,
    int DraftOrders,
    int ApprovedOrders,
    int ReceivedOrders);