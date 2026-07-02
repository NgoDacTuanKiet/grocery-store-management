package com.grocery_app.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grocery_app.model.dto.ResponseDto;
import com.grocery_app.model.dto.request.CategoryRequest;
import com.grocery_app.model.dto.response.CategoryResponse;
import com.grocery_app.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseDto<List<CategoryResponse>> getCategories(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return categoryService.getList(pageable, search);
    }

    @GetMapping("/{id}")
    public ResponseDto<CategoryResponse> getCategoryById(@RequestParam Long id) {
        return ResponseDto.<CategoryResponse>builder()
                .success(true)
                .data(categoryService.getById(id))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseDto<CategoryResponse> createCategory(@RequestBody CategoryRequest request) {
        return ResponseDto.<CategoryResponse>builder()
                .success(true)
                .data(categoryService.createCategory(request))
                .message("Thêm danh mục mới thành công!")
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseDto<CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        return ResponseDto.<CategoryResponse>builder()
                .success(true)
                .data(categoryService.update(id, request))
                .message("Cập nhật danh mục thành công!")
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseDto<String> deleteCategory(@PathVariable Long id) {
        categoryService.softDeleteCategory(id);
        return ResponseDto.< String >builder()
                .success(true)
                .message("Xóa danh mục thành công!")
                .build();
    }
}
