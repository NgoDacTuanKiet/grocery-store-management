package com.grocery_app.model.dto.request;

import com.grocery_app.model.enums.PaymentMethod;
import lombok.Data;

@Data
public class PaymentReceiptRequest {
    private Long customerId;
    private Double amount;
    private PaymentMethod paymentMethod;
    private String note;
}
