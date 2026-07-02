package com.grocery_app.service;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grocery_app.model.dto.request.CreateCustomerRequest;
import com.grocery_app.model.dto.response.CustomerResponse;
import com.grocery_app.model.entity.Customer;
import com.grocery_app.repository.CustomerRepository;

@Service
public class CustomerService extends GetListPageableService <Customer, CustomerResponse> {
    
    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;

    public CustomerService(CustomerRepository customerRepository, ModelMapper modelMapper) {
        super(customerRepository, modelMapper, CustomerResponse.class);
        this.customerRepository = customerRepository;
        this.modelMapper = modelMapper;
    }
    
    @Transactional(rollbackFor = Exception.class)
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if(customerRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã tồn tại trong hệ thống, vui lòng kiểm tra lại!");
        }
        Customer customer = modelMapper.map(request, Customer.class);

        Customer savedCustomer = customerRepository.save(customer);

        return modelMapper.map(savedCustomer, CustomerResponse.class);
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + id));
        return modelMapper.map(customer, CustomerResponse.class);
    }
}
