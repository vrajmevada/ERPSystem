using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record ShortCloseTransferSlipDto(
    List<ShortCloseTransferSlipLineDto> Lines);
