package com.grocery_app.service;

import com.grocery_app.model.dto.request.ProductRequest;
import com.grocery_app.model.dto.response.ProductResponse;
import com.grocery_app.model.entity.Category;
import com.grocery_app.model.entity.Product;
import com.grocery_app.repository.CategoryRepository;
import com.grocery_app.repository.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService extends GetListPageableService<Product, ProductResponse> {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    public ProductService(ProductRepository productRepository, 
                          CategoryRepository categoryRepository, 
                          ModelMapper modelMapper) {
        super(productRepository, modelMapper, ProductResponse.class);
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    protected List<String> getSearchFields() {
        return List.of("name", "description");
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        return mapToResponse(product);
    }

     //Tạo mới Sản phẩm kèm các biến thể
    @Transactional(rollbackFor = Exception.class)
    public ProductResponse createProduct(ProductRequest request) {
        //Kiểm tra Category có tồn tại không
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại!"));

        //Map dữ liệu từ Request sang Entity
        Product product = modelMapper.map(request, Product.class);
        product.setId(null);
        product.setCategory(category); // Gán danh mục vào sản phẩm

        //Gán Product vào từng ProductDetail
        if (product.getProductDetails() != null) {
            product.getProductDetails().forEach(detail -> {
                detail.setProduct(product); // Nối khóa ngoại: detail.product_id = product.id
            });
        }

        // 4. Lưu vào DB (JPA sẽ tự động lưu cả Product lẫn ProductDetail nhờ cascade = ALL)
        Product savedProduct = productRepository.save(product);

        return mapToResponse(savedProduct);
    }

    @Transactional(rollbackFor = Exception.class)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại!"));

        existingProduct.setName(request.getName());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setCategory(category);
        
        // Cập nhật thuộc tính chung
        if (existingProduct.getAttributes() != null) {
            existingProduct.getAttributes().clear();
        }
        if (request.getAttributes() != null) {
            existingProduct.getAttributes().addAll(request.getAttributes());
        }

        // Cập nhật ProductDetail (Variants)
        List<com.grocery_app.model.entity.ProductDetail> existingDetails = existingProduct.getProductDetails();
        List<com.grocery_app.model.dto.request.ProductDetailRequest> reqDetails = request.getProductDetails();
        
        if (reqDetails != null) {
            // Xóa các variant bị loại bỏ
            existingDetails.removeIf(existing -> reqDetails.stream()
                    .noneMatch(req -> req.getId() != null && req.getId().equals(existing.getId())));
                    
            // Cập nhật hoặc thêm mới
            for (var detailReq : reqDetails) {
                if (detailReq.getId() != null) {
                    existingDetails.stream()
                            .filter(e -> e.getId().equals(detailReq.getId()))
                            .findFirst()
                            .ifPresent(existing -> {
                                existing.setPrice(detailReq.getPrice());
                                existing.setCostPrice(detailReq.getCostPrice());
                                existing.setStockQuantity(detailReq.getStockQuantity());
                                existing.getAttributes().clear();
                                if (detailReq.getAttributes() != null) {
                                    existing.getAttributes().putAll(detailReq.getAttributes());
                                }
                            });
                } else {
                    com.grocery_app.model.entity.ProductDetail newDetail = modelMapper.map(detailReq, com.grocery_app.model.entity.ProductDetail.class);
                    newDetail.setProduct(existingProduct);
                    existingDetails.add(newDetail);
                }
            }
        } else {
            existingDetails.clear();
        }

        Product savedProduct = productRepository.save(existingProduct);
        return mapToResponse(savedProduct);
    }

    //Hàm map thủ công để lấy được tên Danh mục (Category Name)
    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = modelMapper.map(product, ProductResponse.class);
        if (product.getCategory() != null) {
            response.setCategoryName(product.getCategory().getName());
            // response.setCategoryId(...) ModelMapper đã tự làm nếu đặt tên trùng khớp
        }
        return response;
    }
}