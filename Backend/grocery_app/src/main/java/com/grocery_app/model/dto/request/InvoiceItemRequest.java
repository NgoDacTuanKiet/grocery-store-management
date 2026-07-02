package com.grocery_app.model.dto.request;

import lombok.Data;

@Data
public class InvoiceItemRequest {
    private Long productId;
    private String productName;
    private Double unitPrice;
    private Integer quantity;
}
