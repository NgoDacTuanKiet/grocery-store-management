package com.grocery_app.controller;

import com.grocery_app.model.dto.ResponseDto;
import com.grocery_app.model.dto.request.ProductRequest;
import com.grocery_app.model.dto.response.ProductResponse;
import com.grocery_app.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

     //Lấy danh sách sản phẩm (Phân trang, Tìm kiếm, Lọc theo danh mục)
    @GetMapping
    public ResponseDto<List<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            Pageable pageable) {
            
        Map<String, Object> filters = new HashMap<>();
        if (categoryId != null) {
            filters.put("category.id", categoryId); // Lọc theo khóa ngoại
        }
        
        return productService.getList(pageable, search, filters);
    }

     //Lấy chi tiết 1 sản phẩm
    @GetMapping("/{id}")
    public ResponseDto<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseDto.<ProductResponse>builder()
                .success(true)
                .data(productService.getProductById(id))
                .build();
    }

     //Tạo sản phẩm mới (Chỉ OWNER)
    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseDto<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        return ResponseDto.<ProductResponse>builder()
                .success(true)
                .message("Tạo sản phẩm thành công!")
                .data(productService.createProduct(request))
                .build();
    }

     //Cập nhật sản phẩm (Chỉ OWNER)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseDto<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        return ResponseDto.<ProductResponse>builder()
                .success(true)
                .message("Cập nhật sản phẩm thành công!")
                .data(productService.updateProduct(id, request))
                .build();
    }
}