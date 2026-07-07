package com.restaurant.restaurant_management_Sys.entity;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Category extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false,  length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private String status;

    @OneToMany(mappedBy = "category",
            orphanRemoval = true,
            cascade = CascadeType.ALL)
    private Set<MenuItem> menuItems = new HashSet<> ();

}

