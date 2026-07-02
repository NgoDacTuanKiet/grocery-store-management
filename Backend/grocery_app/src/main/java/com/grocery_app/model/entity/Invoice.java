package com.grocery_app.model.entity;

import com.grocery_app.model.enums.InvoiceStatus;
import com.grocery_app.model.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.List;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Invoice extends BaseModel {
    @Column(unique = true)
    private String invoiceCode;

    // Liên kết với Customer và User (Staff)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items;

    private Double totalAmount;
    private Double paidAmount;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
}