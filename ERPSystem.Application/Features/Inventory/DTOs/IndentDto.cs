namespace ERPSystem.Application.Features.Inventory.DTOs;

public record IndentDto(
    int Id,
    string VoucherNo,
    int RequestingDeptId,
    string RequestingDeptName,
    int TargetDeptId,
    string TargetDeptName,
    DateTime IndentDate,
    string Remarks,
    string Priority,
    string Status,
    List<IndentLineDto> Lines);