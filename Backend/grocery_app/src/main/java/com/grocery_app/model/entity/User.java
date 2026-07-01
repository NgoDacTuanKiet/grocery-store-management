package com.grocery_app.model.entity;

import com.grocery_app.model.enums.Role;
import com.grocery_app.model.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseModel {

    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    private String fullName;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status;
}