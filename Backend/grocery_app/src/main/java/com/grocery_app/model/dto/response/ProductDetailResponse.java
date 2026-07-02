package com.grocery_app.model.dto.response;

import java.util.Map;

import lombok.Data;

@Data
class ProductDetailResponse {
    private Long id;
    private Map<String, String> attributes;
    private Double price;
    private Double costPrice;
    private Integer stockQuantity;
}