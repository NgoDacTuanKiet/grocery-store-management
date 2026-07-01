package com.grocery_app.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "invoice_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    // Snapshot dữ liệu (Không liên kết @ManyToOne với Product/ProductDetail để tránh mất lịch sử khi xóa SP)
    private Long productId;
    private String productName;
    private Double unitPrice;
    private Integer quantity;
    private Double subTotal;
}