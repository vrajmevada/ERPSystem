using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record MaterialInwardDto(
    int Id,
    string InwardNumber,
    int WarehouseId,
    string WarehouseName,
    DateTime TransactionDate,
    string Remarks,
    string Status,
    string InwardType,
    string ReferenceNumber,
    List<MaterialInwardLineDto> Lines);
