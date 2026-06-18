using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateTransferSlipDto(
    int FromWarehouseId,
    int ToWarehouseId,
    string Remarks,
    List<CreateTransferSlipLineDto> Lines);
