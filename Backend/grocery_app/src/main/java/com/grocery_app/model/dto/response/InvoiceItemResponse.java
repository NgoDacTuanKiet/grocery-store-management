package com.grocery_app.model.dto.response;

import lombok.Data;

@Data
public class InvoiceItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Double unitPrice;
    private Integer quantity;
    private Double subTotal;
}