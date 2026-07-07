package com.grocery_app.model.dto.request;

import java.util.List;

import com.grocery_app.model.enums.PaymentMethod;

import lombok.Data;

@Data
public class InvoiceRequest {
    private Long customerId; // Có thể null nếu là khách vãng lai
    private Double paidAmount; // Số tiền khách đưa
    private PaymentMethod paymentMethod;
    private List<InvoiceItemRequest> items; // Danh sách hàng hóa khách mua
    private CreateCustomerRequest newCustomer;
}
