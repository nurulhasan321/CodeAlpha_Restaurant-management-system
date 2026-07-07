package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.InventoryItemReq;
import com.restaurant.restaurant_management_Sys.dto.response.InventoryItemRes;
import com.restaurant.restaurant_management_Sys.entity.Category;
import com.restaurant.restaurant_management_Sys.entity.InventoryItem;
import com.restaurant.restaurant_management_Sys.repository.CategoryRepository;
import com.restaurant.restaurant_management_Sys.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryRepo;
    private final CategoryRepository categoryRepo;

    public List<InventoryItemRes> getAllItems() {
        return inventoryRepo.findAll().stream().map(this::mapToRes).toList();
    }

    public InventoryItemRes addItem(InventoryItemReq req) {
        Category category = null;
        if (req.categoryId() != null) {
            category = categoryRepo.findById(req.categoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        InventoryItem item = InventoryItem.builder()
                .itemName(req.itemName())
                .skuCode(req.skuCode())
                .quantity(req.quantity())
                .unit(req.unit())
                .minimumThreshold(req.minimumThreshold())
                .status(calculateStatus(req.quantity(), req.minimumThreshold()))
                .category(category)
                .build();

        return mapToRes(inventoryRepo.save(item));
    }

    public InventoryItemRes restockItem(Long id, Double additionalQuantity) {
        InventoryItem item = inventoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        
        item.setQuantity(item.getQuantity() + additionalQuantity);
        item.setStatus(calculateStatus(item.getQuantity(), item.getMinimumThreshold()));
        
        return mapToRes(inventoryRepo.save(item));
    }

    public InventoryItemRes updateItem(Long id, InventoryItemReq req) {
        InventoryItem item = inventoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        
        Category category = null;
        if (req.categoryId() != null) {
            category = categoryRepo.findById(req.categoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }
        
        item.setItemName(req.itemName());
        item.setSkuCode(req.skuCode());
        item.setQuantity(req.quantity());
        item.setUnit(req.unit());
        item.setMinimumThreshold(req.minimumThreshold());
        item.setStatus(calculateStatus(req.quantity(), req.minimumThreshold()));
        item.setCategory(category);
        
        return mapToRes(inventoryRepo.save(item));
    }

    public InventoryItemRes deductItem(Long id, Double quantity) {
        InventoryItem item = inventoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        
        double newQuantity = item.getQuantity() - quantity;
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient stock for: " + item.getItemName() + ". Available: " + item.getQuantity() + " " + item.getUnit());
        }
        item.setQuantity(newQuantity);
        item.setStatus(calculateStatus(item.getQuantity(), item.getMinimumThreshold()));
        
        return mapToRes(inventoryRepo.save(item));
    }

    public void deductForOrder(com.restaurant.restaurant_management_Sys.entity.Order order) {
        for (var orderItem : order.getOrderItems()) {
            if (orderItem.getMenuItem().getRecipeIngredients() != null) {
                for (var recipeIngredient : orderItem.getMenuItem().getRecipeIngredients()) {
                    InventoryItem inventoryItem = recipeIngredient.getInventoryItem();
                    Double amountNeeded = recipeIngredient.getQuantityRequired() * orderItem.getQuantity();
                    
                    double newQty = inventoryItem.getQuantity() - amountNeeded;
                    if (newQty < 0) {
                        throw new RuntimeException("Insufficient stock for ingredient: " + inventoryItem.getItemName() + ". Need: " + amountNeeded + " " + inventoryItem.getUnit() + ", Available: " + inventoryItem.getQuantity());
                    }
                    inventoryItem.setQuantity(newQty);
                    inventoryItem.setStatus(calculateStatus(inventoryItem.getQuantity(), inventoryItem.getMinimumThreshold()));
                    
                    inventoryRepo.save(inventoryItem);
                }
            }
        }
    }

    public String deleteItem(Long id) {
        InventoryItem item = inventoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        inventoryRepo.delete(item);
        return "Item deleted successfully";
    }

    public void checkAndAlertLowStock() {
        List<InventoryItem> lowStockItems = inventoryRepo.findAll().stream()
                .filter(item -> item.getQuantity() <= item.getMinimumThreshold())
                .toList();

        for (InventoryItem item : lowStockItems) {
            System.out.println("ALERT: Low Stock for " + item.getItemName() +
                    " (SKU: " + item.getSkuCode() + "). Current quantity: " +
                    item.getQuantity() + " " + item.getUnit() + ". Minimum threshold: " +
                    item.getMinimumThreshold());
        }
    }

    private String calculateStatus(Double quantity, Double threshold) {
        if (quantity <= 0) return "OUT_OF_STOCK";
        if (quantity <= threshold) return "LOW_STOCK";
        return "IN_STOCK";
    }

    private InventoryItemRes mapToRes(InventoryItem item) {
        return new InventoryItemRes(
                item.getId(),
                item.getItemName(),
                item.getSkuCode(),
                item.getQuantity(),
                item.getUnit(),
                item.getMinimumThreshold(),
                item.getStatus(),
                item.getCategory() != null ? item.getCategory().getId() : null,
                item.getCategory() != null ? item.getCategory().getName() : "None"
        );
    }
}
