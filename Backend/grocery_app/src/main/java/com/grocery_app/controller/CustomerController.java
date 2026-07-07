package com.grocery_app.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grocery_app.model.dto.ResponseDto;
import com.grocery_app.model.dto.request.CreateCustomerRequest;
import com.grocery_app.model.dto.response.CustomerResponse;
import com.grocery_app.service.CustomerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    
    @GetMapping()
    public ResponseDto<List<CustomerResponse>> getCustomers(
        @RequestParam(required = false) String search,
        Pageable pageable) {

        return customerService.getList(pageable, search);
    }

    @PostMapping("/create")
    public ResponseDto<CustomerResponse> createCustomer(@RequestBody CreateCustomerRequest request) {
        CustomerResponse newCustomer = customerService.createCustomer(request);
        return ResponseDto.<CustomerResponse>builder()
                .success(true)
                .message("Thêm khách hàng mới thành công!")
                .data(newCustomer)
                .build();
    }

    @GetMapping("/{id}")
    public ResponseDto<CustomerResponse> getCustomerById(@PathVariable Long id) {
        return ResponseDto.<CustomerResponse>builder()
                .success(true)
                .data(customerService.getCustomerById(id))
                .build();
    }
}
