package com.grocery_app.controller;

import com.grocery_app.model.dto.ResponseDto;
import com.grocery_app.model.dto.auth.LoginRequest;
import com.grocery_app.model.dto.auth.RegisterRequest;
import com.grocery_app.model.entity.User;
import com.grocery_app.repository.UserRepository;
import com.grocery_app.service.auth.JwtService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // API Đăng nhập
    @PostMapping("/login")
    public ResponseDto<String> login(@RequestBody LoginRequest request) {
        // Kiểm tra thông tin đăng nhập
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails user = userDetailsService.loadUserByUsername(request.getUsername());
        String jwtToken = jwtService.generateToken(user);

        return ResponseDto.<String>builder()
                .success(true)
                .message("Đăng nhập thành công!")
                .data(jwtToken)
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
                .build();
        
        userRepository.save(user);

        return ResponseDto.<String>builder()
                .success(true)
                .message("Đăng ký thành công!")
                .build();
    }
}