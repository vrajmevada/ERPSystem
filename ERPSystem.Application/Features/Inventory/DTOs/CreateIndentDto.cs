namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateIndentDto(
    int RequestingDeptId,
    int TargetDeptId,
    string Remarks,
    string Priority,
    List<CreateIndentLineDto> Lines);