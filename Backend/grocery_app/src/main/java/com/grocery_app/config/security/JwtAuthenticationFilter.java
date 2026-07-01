package com.grocery_app.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.grocery_app.service.auth.JwtService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Lấy chuỗi Token từ Header có tên là "Authorization"
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 2. Kiểm tra xem Header có tồn tại và có bắt đầu bằng "Bearer " không
        // "Bearer " là tiêu chuẩn bắt buộc khi gửi JWT từ Frontend lên
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Không có vé thì cho đi tiếp (tới SecurityConfig để chặn lại sau)
            return;
        }

        // 3. Cắt lấy chuỗi token thật sự (bỏ qua 7 ký tự "Bearer ")
        jwt = authHeader.substring(7);
        
        // 4. Giải mã token để lấy username
        username = jwtService.extractUsername(jwt); 

        // 5. Nếu lấy được username và người dùng này chưa được xác thực trong phiên làm việc hiện tại
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Lấy thông tin user từ Database (thông qua UserDetailsImpl ta đã làm trước đó)
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 6. Kiểm tra xem token có còn hạn và có đúng là của user này không
            if (jwtService.isTokenValid(jwt, userDetails)) {
                
                // 7. Tạo "Thẻ thông hành" (Authentication Token) cho người dùng
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities() // Nơi chứa ROLE_OWNER hoặc ROLE_STAFF
                );
                
                // Bổ sung thêm thông tin về chi tiết request (IP, SessionId...)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 8. Đặt thẻ thông hành vào SecurityContext (Đánh dấu người này đã đăng nhập hợp lệ)
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // 9. Chuyển request cho các Filter tiếp theo hoặc đi thẳng vào Controller
        filterChain.doFilter(request, response);
    }
}