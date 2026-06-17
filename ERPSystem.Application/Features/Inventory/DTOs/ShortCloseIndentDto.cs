namespace ERPSystem.Application.Features.Inventory.DTOs;

public record ShortCloseIndentDto(
    List<ShortCloseIndentLineDto> Lines);