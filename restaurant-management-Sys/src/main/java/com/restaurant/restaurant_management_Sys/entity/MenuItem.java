package com.restaurant.restaurant_management_Sys.entity;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.bytecode.enhance.spi.interceptor.AbstractLazyLoadInterceptor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "menu_items")
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class MenuItem extends BaseEntity{


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Positive
    @NotNull
    @Column(nullable = false)
    private Double price;

    @Builder.Default
    @Column
    private Boolean available = true;




    @OneToMany(mappedBy = "menuItem", orphanRemoval = true, cascade = CascadeType.ALL)
    private Set<OrderItem> orderItems = new HashSet<> ();

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category ;
}
