package com.grocery_app.controller;

import com.grocery_app.model.dto.ResponseDto;
import com.grocery_app.model.dto.response.DashboardResponse;
import com.grocery_app.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseDto<DashboardResponse> getDashboard() {
        return ResponseDto.<DashboardResponse>builder()
                .success(true)
                .data(dashboardService.getDashboardData())
                .message("Lấy dữ liệu tổng quan thành công")
                .build();
    }
}
