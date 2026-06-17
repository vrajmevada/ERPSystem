using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record GrnDto(
    int Id,
    string GrnNumber,
    int PurchaseOrderId,
    string PurchaseOrderNumber,
    DateTime ReceivedDate,
    string Remarks,
    string Status,
    List<GrnLineDto> Lines);
