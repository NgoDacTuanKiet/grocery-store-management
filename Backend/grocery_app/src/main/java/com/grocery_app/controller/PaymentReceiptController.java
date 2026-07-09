package com.grocery_app.controller;

import com.grocery_app.model.dto.request.PaymentReceiptRequest;
import com.grocery_app.model.dto.response.PaymentReceiptResponse;
import com.grocery_app.model.dto.ResponseDto;
import com.grocery_app.service.PaymentReceiptService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-receipts")
public class PaymentReceiptController {

    private final PaymentReceiptService paymentReceiptService;

    public PaymentReceiptController(PaymentReceiptService paymentReceiptService) {
        this.paymentReceiptService = paymentReceiptService;
    }

    @PostMapping
    public ResponseDto<PaymentReceiptResponse> createReceipt(@RequestBody PaymentReceiptRequest request) {
        return ResponseDto.<PaymentReceiptResponse>builder()
                .data(paymentReceiptService.createReceipt(request))
                .message("Tạo phiếu thu thành công")
                .success(true)
                .build();
    }

    @GetMapping("/customer/{customerId}")
    public ResponseDto<List<PaymentReceiptResponse>> getReceiptsByCustomer(@PathVariable Long customerId) {
        return ResponseDto.<List<PaymentReceiptResponse>>builder()
                .data(paymentReceiptService.getReceiptsByCustomer(customerId))
                .success(true)
                .build();
    }
}
