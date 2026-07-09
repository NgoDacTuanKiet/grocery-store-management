package com.grocery_app.repository;

import com.grocery_app.model.entity.PaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Long>, JpaSpecificationExecutor<PaymentReceipt> {
    List<PaymentReceipt> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
