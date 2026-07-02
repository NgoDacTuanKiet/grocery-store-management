package com.grocery_app.model.dto.request;

import java.util.Map;

import lombok.Data;

@Data
public class ProductDetailRequest {
    private Map<String, String> attributes; // VD: {"Khối lượng": "500g"}
    private Double price;
    private Double costPrice;
    private Integer stockQuantity;
}