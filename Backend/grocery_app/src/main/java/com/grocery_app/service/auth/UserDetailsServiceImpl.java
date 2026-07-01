package com.grocery_app.service.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.grocery_app.config.security.UserDetailsImpl;
import com.grocery_app.model.entity.User;
import com.grocery_app.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service("userDetailsServiceImpl")
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Tìm User từ DB một cách rõ ràng, không dùng cú pháp rút gọn
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + username));
        
        // Trả về UserDetailsImpl hợp lệ
        return new UserDetailsImpl(user);
    }
}