package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.CategoryReq;
import com.restaurant.restaurant_management_Sys.dto.response.CategoryRes;
import com.restaurant.restaurant_management_Sys.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryRes>> getTables(){
        return ResponseEntity.ok (categoryService.getAllCategories ());
    }

    @PostMapping("/add")
    public ResponseEntity<CategoryRes> addCategory(@RequestBody CategoryReq req){
        return ResponseEntity.ok (categoryService.addCategory (req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryRes> updateCategory(@PathVariable Long id,
                                                      @RequestBody CategoryReq req){
        return ResponseEntity.ok (categoryService.updateCategory (id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id){
        return ResponseEntity.ok (categoryService.deleteCategory (id));
    }

}
