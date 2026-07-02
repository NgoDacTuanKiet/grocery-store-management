package com.grocery_app.model.dto.response;

import java.util.List;

import com.grocery_app.model.enums.InvoiceStatus;
import com.grocery_app.model.enums.PaymentMethod;

import lombok.Data;

@Data
public class InvoiceResponse {
    private Long id;
    private String invoiceCode;
    private String customerName; // Lấy tên hiển thị cho gọn
    private String staffName;
    private Double totalAmount;
    private Double paidAmount;
    private InvoiceStatus status;
    private PaymentMethod paymentMethod;
    private List<InvoiceItemResponse> items;
}