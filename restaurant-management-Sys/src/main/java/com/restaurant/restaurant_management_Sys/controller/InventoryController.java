package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.InventoryItemReq;
import com.restaurant.restaurant_management_Sys.dto.response.InventoryItemRes;
import com.restaurant.restaurant_management_Sys.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryItemRes>> getAllItems() {
        return ResponseEntity.ok(inventoryService.getAllItems());
    }

    @PostMapping("/add")
    public ResponseEntity<InventoryItemRes> addItem(@RequestBody InventoryItemReq req) {
        return ResponseEntity.ok(inventoryService.addItem(req));
    }

    @PutMapping("/{id}/restock")
    public ResponseEntity<InventoryItemRes> restockItem(@PathVariable Long id, @RequestParam Double additionalQuantity) {
        return ResponseEntity.ok(inventoryService.restockItem(id, additionalQuantity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemRes> updateItem(@PathVariable Long id, @RequestBody InventoryItemReq req) {
        return ResponseEntity.ok(inventoryService.updateItem(id, req));
    }

    @PutMapping("/{id}/deduct")
    public ResponseEntity<InventoryItemRes> deductItem(@PathVariable Long id, @RequestParam Double quantity) {
        return ResponseEntity.ok(inventoryService.deductItem(id, quantity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.deleteItem(id));
    }
}
