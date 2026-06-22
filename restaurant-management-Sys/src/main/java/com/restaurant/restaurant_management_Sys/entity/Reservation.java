package com.restaurant.restaurant_management_Sys.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "reservations")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Reservation extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime reservationTime;

    @Column(nullable = false)
    private Integer guestCount;

    @Column(nullable = false)
    private String status;



    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Order> orders = new HashSet<> ();


    @ManyToOne
    @JoinColumn(name = "table_id")
    private RestaurantTable restaurantTable;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;



}
