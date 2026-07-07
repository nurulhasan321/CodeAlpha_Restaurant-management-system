package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.RestaurantTableReq;
import com.restaurant.restaurant_management_Sys.dto.response.RestaurantTableRes;
import com.restaurant.restaurant_management_Sys.service.RestaurantTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/table")
@RequiredArgsConstructor
public class RestaurantTableController {

    private final RestaurantTableService restaurantTableService;

    @GetMapping
    public ResponseEntity<List<RestaurantTableRes>> getAllTables(){
        return ResponseEntity.ok (restaurantTableService.getAllTables ());
    }

    @PostMapping("/add")
    public ResponseEntity<String> addTable(@RequestBody RestaurantTableReq req){
        return ResponseEntity.ok (restaurantTableService.addTable (req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTableRes> updateTable(@PathVariable Long id,@RequestBody RestaurantTableReq request){
        return ResponseEntity.ok (restaurantTableService.updateTable (id,request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTable(@PathVariable Long id){
        return ResponseEntity.ok (restaurantTableService.deleteTable (id));
    }
}
