package com.grocery_app.config.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.grocery_app.model.entity.User;
import com.grocery_app.model.enums.UserStatus;

public class UserDetailsImpl implements UserDetails{
    
    private final User userInfo;

    public UserDetailsImpl(User userInfo) {
        this.userInfo = userInfo;
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();

        // Add Role vào danh sách quyền (Spring Security bắt buộc có tiền tố ROLE_)
        if (userInfo.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + userInfo.getRole().name()));
        }


        return authorities;
    }

    @Override
    public String getPassword() {
        return userInfo.getPassword();
    }

    @Override
    public String getUsername() {
        return userInfo.getUsername();
    }

    // Rất tiện khi đang ở Controller, bạn có thể gọi SecurityContextHolder để lấy thẳng ID người đang login mà không cần query DB!
    public Long getPrincipalId() {
        return userInfo.getId();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; 
    }

    @Override
    public boolean isAccountNonLocked() {
        return userInfo.getStatus() == UserStatus.ACTIVE;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return userInfo.getStatus() == UserStatus.ACTIVE;
    }
    
}