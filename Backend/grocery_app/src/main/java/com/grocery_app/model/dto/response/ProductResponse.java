package com.grocery_app.model.dto.response;

import java.util.List;

import lombok.Data;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private List<String> attributes;
    private List<ProductDetailResponse> productDetails;
}