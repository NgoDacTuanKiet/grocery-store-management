package com.grocery_app.controller;

import com.grocery_app.model.dto.ResponseDto;
import com.grocery_app.model.dto.auth.LoginRequest;
import com.grocery_app.model.dto.auth.RegisterRequest;
import com.grocery_app.model.entity.User;
import com.grocery_app.model.enums.Role;
import com.grocery_app.model.enums.UserStatus;
import com.grocery_app.repository.UserRepository;
import com.grocery_app.service.auth.JwtService;

import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // API Đăng nhập
    @PostMapping("/login")
    public ResponseDto<Map<String, String>> login(@RequestBody LoginRequest request) {
        // Kiểm tra thông tin đăng nhập
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
        String jwtToken = jwtService.generateToken(user);

        return ResponseDto.<Map<String, String>>builder()
                .success(true)
                .message("Đăng nhập thành công!")
                .data(Map.of("token", jwtToken, 
                        "fullName", user.getFullName() != null ? user.getFullName() : user.getUsername(), // Tránh lỗi null nếu chưa nhập tên
                        "role", user.getRole().name()
                ))
                .build();
    }

    // API Đăng ký
    @PostMapping("/register")
    public ResponseDto<String> register(@RequestBody RegisterRequest request) {
        // Kiểm tra xem user đã tồn tại chưa
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseDto.<String>builder()
                    .success(false)
                    .message("Username đã tồn tại!")
                    .build();
        }

        // Tạo user mới
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // BẮT BUỘC MÃ HÓA PASSWORD
                .role(Role.STAFF)
                .status(UserStatus.ACTIVE)
                .fullName(request.getFullName())
                .build();
        
        userRepository.save(user);

        return ResponseDto.<String>builder()
                .success(true)
                .message("Đăng ký thành công!")
                .build();
    }
}