package com.grocery_app.model.dto.response;

import lombok.Data;

@Data
public class CustomerResponse {
    private Long id;
    private String fullName;
    private String phone;
    private Double totalDebt;
}
