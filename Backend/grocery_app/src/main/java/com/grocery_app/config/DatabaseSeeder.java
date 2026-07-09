package com.grocery_app.config;

import com.grocery_app.model.entity.User;
import com.grocery_app.model.enums.Role;
import com.grocery_app.model.enums.UserStatus;
import com.grocery_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem tài khoản admin đã tồn tại chưa
        Optional<User> adminOpt = userRepository.findByUsername("admin");
        
        if (adminOpt.isEmpty()) {
            log.info("Khởi tạo tài khoản OWNER (admin) mặc định...");
            
            User admin = User.builder()
                    .fullName("ADMIN")
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .role(Role.OWNER) // Phân quyền Chủ cửa hàng
                    .status(UserStatus.ACTIVE)
                    .build();
                    
            userRepository.save(admin);
            log.info("Đã tạo thành công tài khoản admin/admin");
        } else {
            log.info("Tài khoản admin đã tồn tại, bỏ qua bước khởi tạo.");
        }
    }
}
