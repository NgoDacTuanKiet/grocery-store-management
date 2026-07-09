package com.grocery_app.config.security;

import com.grocery_app.model.dto.ResponseDto;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Cho phép dùng @PreAuthorize trên từng hàm Controller (rất tiện)
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;

    private final UserDetailsService userDetailsService;
    
    // ObjectMapper dùng để chuyển Java Object (ResponseDto) thành chuỗi JSON
    private final ObjectMapper objectMapper; 

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .csrf(AbstractHttpConfigurer::disable)
            
            // TÍNH NĂNG MỚI (Học từ mẫu): Bắt lỗi Auth và trả về JSON chuẩn
            .exceptionHandling(exception -> exception
                // 1. Lỗi 401: Chưa đăng nhập, không có Token, hoặc Token sai/hết hạn
                .authenticationEntryPoint((request, response, authException) ->
                    writeAuthError(response, HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để tiếp tục"))
                    
                // 2. Lỗi 403: Đã đăng nhập nhưng không đủ quyền (VD: STAFF cố vào trang của OWNER)
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    writeAuthError(response, HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập chức năng này")))

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**", // Mở API đăng nhập
                    "/error"        // Mở endpoint lỗi mặc định của Spring
                ).permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    //Hàm phụ trợ (Học từ mẫu): Ghi đè response trả về của Spring bằng ResponseDto chuẩn
    private void writeAuthError(HttpServletResponse response, HttpStatus httpStatus, String message) throws IOException {
        
        // Tạo DTO báo lỗi
        ResponseDto<Object> responseDto = ResponseDto.builder()
            .success(false)
            .message(message)
            .build();

        // Ép Server trả về mã lỗi HTTP tương ứng (401 hoặc 403)
        response.setStatus(httpStatus.value());
        
        // Báo cho Frontend biết kiểu dữ liệu trả về là JSON (UTF-8 để không bị lỗi font tiếng Việt)
        response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8");
        
        // Biến DTO thành chuỗi JSON và bắn về Frontend
        objectMapper.writeValue(response.getWriter(), responseDto);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        // Truyền userDetailsService vào thẳng đây
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService); 
        
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép Frontend Vite ở cổng 5173 và Nginx ở cổng 80 truy cập
        configuration.setAllowedOrigins(List.of("http://localhost:5173","http://127.0.0.1:5173", "http://localhost", "http://127.0.0.1")); 
        
        // Cho phép tất cả các phương thức HTTP (GET, POST, PUT, DELETE, OPTIONS)
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); 
        
        // Cho phép tất cả các Headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // Bắt buộc phải có dòng này nếu có dùng JWT Token hoặc Cookie
        configuration.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Áp dụng cấu hình này cho mọi đường dẫn API (/**)
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }
}