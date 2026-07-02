package com.grocery_app.service;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grocery_app.model.dto.request.CategoryRequest;
import com.grocery_app.model.dto.response.CategoryResponse;
import com.grocery_app.model.entity.Category;
import com.grocery_app.repository.CategoryRepository;

@Service
public class CategoryService extends GetListPageableService<Category, CategoryResponse> {

    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;
    
    public CategoryService(CategoryRepository categoryRepository, ModelMapper modelMapper) {
        super(categoryRepository, modelMapper, CategoryResponse.class);
        this.categoryRepository = categoryRepository;
        this.modelMapper = modelMapper;
    }
    
    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
        return modelMapper.map(category, CategoryResponse.class);
    }

    @Transactional(rollbackFor = Exception.class)
    public CategoryResponse createCategory(CategoryRequest request) {
        if(categoryRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Tên danh mục đã tồn tại trong hệ thống, vui lòng kiểm tra lại!");
        }
        Category category = modelMapper.map(request, Category.class);
        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryResponse.class);
    }

    @Transactional(rollbackFor = Exception.class)
    public void softDeleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

        category.setDeleted(true);
        categoryRepository.save(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

        if (!category.getName().equals(request.getName()) && categoryRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Tên danh mục đã tồn tại trong hệ thống, vui lòng kiểm tra lại!");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updatedCategory = categoryRepository.save(category);
        return modelMapper.map(updatedCategory, CategoryResponse.class);
    }
}
