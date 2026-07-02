package com.grocery_app.model.dto.request;

import java.util.List;

import lombok.Data;

@Data
public class ProductRequest {
    private String name;
    private Long categoryId; // Chỉ nhận ID của danh mục thay vì cả object
    private String description;
    private List<String> attributes; // VD: ["Khối lượng", "Màu sắc"]
    
    // Mảng các biến thể (variants) truyền từ Frontend lên
    private List<ProductDetailRequest> productDetails; 
}
