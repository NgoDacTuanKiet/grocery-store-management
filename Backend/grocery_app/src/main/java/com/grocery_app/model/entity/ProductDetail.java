package com.grocery_app.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Map;

@Entity
@Table(name = "variants")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product; // Tham chiếu ngược lại Product

    // Lưu dạng Map <String, String> (vd: "Màu sắc" -> "Đen")
    @ElementCollection
    @CollectionTable(name = "product_detail_attributes", joinColumns = @JoinColumn(name = "product_detail_id"))
    @MapKeyColumn(name = "attribute_key")
    @Column(name = "attribute_value")
    private Map<String, String> attributes;

    private Double price;
    private Double costPrice;
    private Integer stockQuantity;
}