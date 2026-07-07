package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.MenuReq;
import com.restaurant.restaurant_management_Sys.dto.response.MenuRes;
import com.restaurant.restaurant_management_Sys.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<List<MenuRes>> getMenuItems(){
        return ResponseEntity.ok (menuService.getAllMenuItems ());
    }

    @PostMapping("/add")
    public ResponseEntity<MenuRes> addMenuItem(@RequestBody MenuReq req){
        return ResponseEntity.ok (menuService.addMenuItem (req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuRes> updateMenuItem(@Valid @RequestBody MenuReq req,@PathVariable Long id){
        return ResponseEntity.ok (menuService.updateMenuItem (id,req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMenuItem( @PathVariable Long id){
        return ResponseEntity.ok (menuService.deleteMenuItem (id));
    }

    @GetMapping("/{id}/recipe")
    public ResponseEntity<java.util.List<com.restaurant.restaurant_management_Sys.dto.response.RecipeIngredientRes>> getRecipe(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getRecipe(id));
    }

    @PutMapping("/{id}/recipe")
    public ResponseEntity<java.util.List<com.restaurant.restaurant_management_Sys.dto.response.RecipeIngredientRes>> updateRecipe(@PathVariable Long id, @RequestBody com.restaurant.restaurant_management_Sys.dto.request.RecipeReq req) {
        return ResponseEntity.ok(menuService.updateRecipe(id, req));
    }
}
