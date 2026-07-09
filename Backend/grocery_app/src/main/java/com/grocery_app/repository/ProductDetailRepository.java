package com.grocery_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grocery_app.model.entity.ProductDetail;
import java.util.List;

@Repository
public interface ProductDetailRepository extends JpaRepository<ProductDetail, Long> {
    Long countByStockQuantityLessThanEqual(Integer quantity);
    List<ProductDetail> findTop5ByStockQuantityLessThanEqualOrderByStockQuantityAsc(Integer quantity);
}