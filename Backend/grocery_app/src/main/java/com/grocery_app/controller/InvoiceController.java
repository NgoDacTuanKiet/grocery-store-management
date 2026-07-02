package com.grocery_app.controller;

import com.grocery_app.model.dto.ResponseDto;
import com.grocery_app.model.dto.request.InvoiceRequest;
import com.grocery_app.model.dto.response.InvoiceResponse;
import com.grocery_app.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    //Xem danh sách hóa đơn
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    public ResponseDto<List<InvoiceResponse>> getInvoices(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        // Có thể áp dụng logic lọc: STAFF chỉ xem hóa đơn mình tạo, OWNER xem tất cả
        return invoiceService.getList(pageable, search);
    }

    //Xem chi tiết hóa đơn
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    public ResponseDto<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseDto.<InvoiceResponse>builder()
                .success(true)
                .data(invoiceService.getInvoiceById(id))
                .build();
    }

    //Tạo hóa đơn (Bán hàng)
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    public ResponseDto<InvoiceResponse> createInvoice(@RequestBody InvoiceRequest request) {
        return ResponseDto.<InvoiceResponse>builder()
                .success(true)
                .message("Tạo hóa đơn thành công!")
                .data(invoiceService.createInvoice(request))
                .build();
    }
}