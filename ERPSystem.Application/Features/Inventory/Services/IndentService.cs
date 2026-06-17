using ERPSystem.Application.Common;
using ERPSystem.Application.Exceptions;
using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Services;

public class IndentService : IIndentService
{
    private readonly IIndentRepository _repository;

    public IndentService(IIndentRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<IndentDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        var (items, totalCount) = await _repository.GetAllAsync(search, sortBy, page, pageSize);
        var dtos = items.Adapt<List<IndentDto>>();

        return new PagedResult<IndentDto>(
            dtos,
            totalCount,
            page ?? 1,
            pageSize ?? totalCount);
    }

    public async Task<IndentDto?> GetByIdAsync(int id)
    {
        var indent = await _repository.GetByIdAsync(id);
        if (indent == null) return null;

        return indent.Adapt<IndentDto>();
    }

    public async Task<IndentDto> CreateAsync(CreateIndentDto dto)
    {
        // Generate a unique voucher number (e.g. IND-Ticks)
        var voucherNo = $"IND-{DateTime.UtcNow.Ticks}";

        var indent = new Indent
        {
            VoucherNo = voucherNo,
            RequestingDeptId = dto.RequestingDeptId,
            TargetDeptId = dto.TargetDeptId,
            IndentDate = DateTime.UtcNow,
            Remarks = dto.Remarks,
            Priority = dto.Priority,
            Status = "Pending"
        };

        // Assign incremental LineNo values starting at 1
        int currentLineNo = 1;
        foreach (var lineDto in dto.Lines)
        {
            indent.Lines.Add(new IndentLine
            {
                LineNo = currentLineNo++,
                ProductId = lineDto.ProductId,
                Quantity = lineDto.Quantity,
                EstimatedRate = lineDto.EstimatedRate,
                Notes = lineDto.Notes
            });
        }

        await _repository.AddAsync(indent);

        // Fetch back with related tables loaded (needed for mapping name strings)
        var savedIndent = await _repository.GetByIdAsync(indent.Id);
        return savedIndent.Adapt<IndentDto>();
    }

    public async Task ApproveAsync(int id)
    {
        var indent = await _repository.GetByIdAsync(id);
        if (indent == null)
            throw new BusinessException("Indent not found.");

        if (indent.Status != "Pending")
            throw new BusinessException("Only pending indents can be approved.");

        indent.Status = "Approved";
        await _repository.UpdateAsync(indent);
    }

    public async Task DisapproveAsync(int id)
    {
        var indent = await _repository.GetByIdAsync(id);
        if (indent == null)
            throw new BusinessException("Indent not found.");

        if (indent.Status != "Pending")
            throw new BusinessException("Only pending indents can be disapproved.");

        indent.Status = "Disapproved";
        await _repository.UpdateAsync(indent);
    }

    public async Task DeleteAsync(int id)
    {
        var indent = await _repository.GetByIdAsync(id);
        if (indent == null)
            throw new BusinessException("Indent not found.");

        await _repository.DeleteAsync(indent);
    }

    public async Task ShortCloseAsync(int id, ShortCloseIndentDto dto)
    {
        var indent = await _repository.GetByIdAsync(id);
        if (indent == null)
            throw new BusinessException("Indent not found.");

        if (indent.Status != "Approved")
            throw new BusinessException("Only Approved indents can be short closed.");

        foreach (var lineDto in dto.Lines)
        {
            var line = indent.Lines.FirstOrDefault(l => l.Id == lineDto.IndentLineId);
            if (line == null)
                throw new BusinessException($"Indent Line ID {lineDto.IndentLineId} not found on this Indent.");

            decimal remainingQuantity = line.Quantity - line.ShortClosedQuantity;

            if (lineDto.ShortCloseQuantity < 0)
                throw new BusinessException("Short close quantity cannot be negative.");

            if (lineDto.ShortCloseQuantity > remainingQuantity)
                throw new BusinessException($"Short close quantity ({lineDto.ShortCloseQuantity}) cannot exceed remaining open quantity ({remainingQuantity}) for Product ID {line.ProductId}.");

            line.ShortClosedQuantity += lineDto.ShortCloseQuantity;
        }

        bool allClosed = indent.Lines.All(l => l.ShortClosedQuantity >= l.Quantity);
        if (allClosed)
        {
            indent.Status = "Closed";
        }

        await _repository.UpdateAsync(indent);
    }
}