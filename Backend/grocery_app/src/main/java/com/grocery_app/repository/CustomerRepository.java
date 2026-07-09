package com.grocery_app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;

import com.grocery_app.model.entity.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {
    Optional<Customer> findByPhone(String phone);

    @Query("SELECT COALESCE(SUM(c.totalDebt), 0) FROM Customer c")
    Double getTotalDebt();

    List<Customer> findTop5ByOrderByTotalDebtDesc();
}
