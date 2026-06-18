using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record MaterialOutwardDto(
    int Id,
    string OutwardNumber,
    int WarehouseId,
    string WarehouseName,
    DateTime TransactionDate,
    string Remarks,
    string Status,
    string OutwardType,
    string ReferenceNumber,
    List<MaterialOutwardLineDto> Lines);
