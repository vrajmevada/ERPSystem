namespace ERPSystem.Application.Features.Reports.DTOs;

public record SalesSummaryDto(
    int TotalOrders,
    int DraftOrders,
    int ConfirmedOrders,
    int ShippedOrders);