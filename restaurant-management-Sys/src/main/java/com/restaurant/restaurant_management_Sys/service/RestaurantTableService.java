package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.RestaurantTableReq;
import com.restaurant.restaurant_management_Sys.dto.response.RestaurantTableRes;
import com.restaurant.restaurant_management_Sys.entity.RestaurantTable;
import com.restaurant.restaurant_management_Sys.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {


    private final RestaurantTableRepository restaurantTableRepo ;




    public String addTable(RestaurantTableReq request){

        if(restaurantTableRepo.existsByTableNumber (request.tableNumber ())){
            throw new RuntimeException ("Table is already present, choose different table number!");
        }
        RestaurantTable table = RestaurantTable.builder ()
                .tableNumber(request.tableNumber ())
                .capacity (request.capacity ())
                .location (request.location ())
                .status (request.status ())
                .build ();

        restaurantTableRepo.save (table);
        return "Table "+request.tableNumber ()+" was added successfully";
    }




    public List<RestaurantTableRes> getAllTables(){
        List<RestaurantTable> tables = restaurantTableRepo.findAll ();
        return tables.stream ()
                .map (table -> new RestaurantTableRes (
                        table.getId (),
                        table.getTableNumber (),
                        table.getCapacity (),
                        table.getStatus (),
                        table.getLocation ()
                )).toList ();
    }



    public String deleteTable(Long id){

        RestaurantTable restaurantTable = restaurantTableRepo.findById (id)
                .orElseThrow (()->new RuntimeException ("Table not found!"));
        restaurantTableRepo.delete (restaurantTable);

        return restaurantTable.getTableNumber ()+" was successfully deleted!";

    }

    public RestaurantTableRes updateTable(Long id, RestaurantTableReq request){

        if(restaurantTableRepo.existsByTableNumberAndIdNot (request.tableNumber (),id)){
            throw new RuntimeException("Table number already exists!");
        }
        RestaurantTable restaurantTable = restaurantTableRepo.findById (id)
                .orElseThrow (()->new RuntimeException ("Table not found"));



        restaurantTable.setTableNumber (request.tableNumber ());
        restaurantTable.setCapacity (request.capacity ());
        restaurantTable.setStatus (request.status ());
        restaurantTable.setLocation (request.location ());

        RestaurantTable updatedTable = restaurantTableRepo.save (restaurantTable);

        return new RestaurantTableRes (
                updatedTable.getId (),
                updatedTable.getTableNumber (),
                updatedTable.getCapacity (),
                updatedTable.getStatus (),
                updatedTable.getLocation ()
        );
    }



}
