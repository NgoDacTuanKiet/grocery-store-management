package com.grocery_app.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grocery_app.model.dto.ResponseDto;
import com.grocery_app.model.dto.request.CreateUserRequest;
import com.grocery_app.model.dto.response.UserResponse;
import com.grocery_app.model.enums.Role;
import com.grocery_app.model.enums.UserStatus;
import com.grocery_app.service.UserService;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    
    @GetMapping("/profile")
    public ResponseDto<UserResponse> getMyProfile() {
        return ResponseDto.<UserResponse>builder()
                .success(true)
                .data(userService.getCurrentUserProfile())
                .build();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')") // Chặn quyền, chỉ Chủ cửa hàng mới được xem
    public ResponseDto<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseDto.<UserResponse>builder()
                .success(true)
                .data(userService.getUserById(id))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseDto<List<UserResponse>> getUsers(
            @RequestParam(required = false) String search, // Keyword tìm kiếm chung (tên, email)
            @RequestParam(required = false) String role,   // Lọc chính xác theo role
            @RequestParam(required = false) String status, // Lọc theo trạng thái
            Pageable pageable) {                           // Tự động nhận page, size, sort từ URL

        // Đóng gói các điều kiện lọc (Filter) thành một Map để ném cho Class cha xử lý
        Map<String, Object> filters = new HashMap<>();
        if (role != null && !role.trim().isEmpty()) {
            try {
                Role enumRole = Role.valueOf(role.toUpperCase());
                
                filters.put("role", enumRole);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Role không hợp lệ");
            }
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isOwner = auth.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_OWNER"));
        
        if (!isOwner) {
            filters.put("status", UserStatus.ACTIVE);
        } else {
            if (status != null && !status.trim().isEmpty()) {
                try {
                    filters.put("status", UserStatus.valueOf(status.toUpperCase())); 
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Trạng thái (Status) không hợp lệ");
                }
            }
        }
        // Gọi hàm của class cha: Truyền pageable, keyword tìm kiếm, và bộ lọc vào
        return userService.getList(pageable, search, filters);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseDto<String> deleteUser(@PathVariable Long id) {
        
        userService.deleteUser(id);
        
        return ResponseDto.<String>builder()
                .success(true)
                .message("Đã xóa (vô hiệu hóa) người dùng thành công!")
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')") // Chỉ có Chủ cửa hàng mới được truy cập bấm nút tạo
    public ResponseDto<UserResponse> createStaff(@RequestBody CreateUserRequest request) {
        
        UserResponse newStaff = userService.createStaff(request);
        
        return ResponseDto.<UserResponse>builder()
                .success(true)
                .message("Tạo tài khoản nhân viên mới thành công!")
                .data(newStaff)
                .build();
    }
}
