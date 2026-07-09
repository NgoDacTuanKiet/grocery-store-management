package com.grocery_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.grocery_app.model.entity.Invoice;
import com.grocery_app.model.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {
    List<Invoice> findByCustomerIdAndStatusOrderByCreatedAtAsc(Long customerId, InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE DATE(i.createdAt) = CURRENT_DATE")
    Double getTodayRevenue();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE DATE(i.createdAt) = CURRENT_DATE")
    Long countTodayOrders();

    List<Invoice> findTop5ByOrderByCreatedAtDesc();

    @Query(value = "SELECT DATE(created_at) as date, SUM(total_amount) as revenue " +
                   "FROM invoices " +
                   "WHERE created_at >= DATE(DATE_SUB(NOW(), INTERVAL 6 DAY)) " +
                   "GROUP BY DATE(created_at) " +
                   "ORDER BY DATE(created_at) ASC", nativeQuery = true)
    List<Object[]> getLast7DaysRevenue();
}
