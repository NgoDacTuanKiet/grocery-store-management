package com.grocery_app.model.dto.response;

import com.grocery_app.model.enums.PaymentMethod;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentReceiptResponse {
    private Long id;
    private String receiptCode;
    private Long customerId;
    private String customerName;
    private String staffName;
    private Double amount;
    private PaymentMethod paymentMethod;
    private String note;
    private LocalDateTime createdAt;
}
