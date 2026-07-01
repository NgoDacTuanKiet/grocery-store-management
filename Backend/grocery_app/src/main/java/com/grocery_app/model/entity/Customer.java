package com.grocery_app.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "customers")
@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends BaseModel {

    private String fullName;

    @Column(unique = true, nullable = false)
    private String phoneNumber;

    @Builder.Default
    private Double totalDebt = 0.0;

}