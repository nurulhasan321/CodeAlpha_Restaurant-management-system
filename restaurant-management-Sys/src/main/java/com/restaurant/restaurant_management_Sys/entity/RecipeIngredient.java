package com.restaurant.restaurant_management_Sys.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(name = "recipe_ingredients")
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class RecipeIngredient extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @ManyToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Positive
    @NotNull
    @Column(name = "quantity_required", nullable = false)
    private Double quantityRequired;
}
