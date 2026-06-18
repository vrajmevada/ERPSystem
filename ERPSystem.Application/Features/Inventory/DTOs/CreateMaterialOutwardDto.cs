using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateMaterialOutwardDto(
    int WarehouseId,
    DateTime TransactionDate,
    string Remarks,
    string OutwardType,
    string ReferenceNumber,
    List<CreateMaterialOutwardLineDto> Lines);
