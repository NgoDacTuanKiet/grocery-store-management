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