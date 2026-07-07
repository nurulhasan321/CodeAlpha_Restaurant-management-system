package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.response.CustomerRes;
import com.restaurant.restaurant_management_Sys.entity.User;
import com.restaurant.restaurant_management_Sys.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepo;

    public List<CustomerRes> getAllCustomers() {
        List<User> customers = userRepo.findByRoleName("CUSTOMER");
        return customers.stream()
                .map(customer -> new CustomerRes(
                        customer.getId(),
                        customer.getName(),
                        customer.getEmail(),
                        customer.getPhone(),
                        customer.getActive()
                )).toList();
    }
}
