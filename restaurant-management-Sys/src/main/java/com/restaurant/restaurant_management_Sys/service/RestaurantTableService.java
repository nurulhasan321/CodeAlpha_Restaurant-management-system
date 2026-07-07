package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.RestaurantTableReq;
import com.restaurant.restaurant_management_Sys.dto.response.RestaurantTableRes;
import com.restaurant.restaurant_management_Sys.entity.RestaurantTable;
import com.restaurant.restaurant_management_Sys.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.restaurant.restaurant_management_Sys.entity.Reservation;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<RestaurantTableRes> getAllTables(){
        List<RestaurantTable> tables = restaurantTableRepo.findAll ();
        return tables.stream ()
                .map (this::mapToRes).toList ();
    }

    public String deleteTable(Long id){

        RestaurantTable restaurantTable = restaurantTableRepo.findById (id)
                .orElseThrow (()->new RuntimeException ("Table not found!"));
                
        restaurantTableRepo.delete (restaurantTable);

        return "Table was successfully deleted!";

    }

    @Transactional
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

        return mapToRes(updatedTable);
    }

    private RestaurantTableRes mapToRes(RestaurantTable table) {
        String reservedBy = null;
        String reservedEmail = null;
        String reservedPhone = null;

        if ("RESERVED".equalsIgnoreCase(table.getStatus())) {
            if (table.getReservations() != null) {
                for (Reservation r : table.getReservations()) {
                    if ("PENDING".equalsIgnoreCase(r.getStatus()) || "CONFIRMED".equalsIgnoreCase(r.getStatus())) {
                        if (r.getUser() != null) {
                            reservedBy = r.getUser().getName();
                            reservedEmail = r.getUser().getEmail();
                            reservedPhone = r.getUser().getPhone();
                        } else {
                            reservedBy = "Guest";
                            reservedEmail = "N/A";
                            reservedPhone = "N/A";
                        }
                        break;
                    }
                }
            }
        }

        return new RestaurantTableRes (
                table.getId (),
                table.getTableNumber (),
                table.getCapacity (),
                table.getStatus (),
                table.getLocation (),
                reservedBy,
                reservedEmail,
                reservedPhone
        );
    }

}
