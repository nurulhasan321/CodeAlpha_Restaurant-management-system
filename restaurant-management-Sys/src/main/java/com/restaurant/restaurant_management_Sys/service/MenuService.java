package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.MenuReq;
import com.restaurant.restaurant_management_Sys.dto.response.MenuRes;
import com.restaurant.restaurant_management_Sys.entity.Category;
import com.restaurant.restaurant_management_Sys.entity.MenuItem;
import com.restaurant.restaurant_management_Sys.repository.CategoryRepository;
import com.restaurant.restaurant_management_Sys.repository.MenuRepository;
import com.restaurant.restaurant_management_Sys.repository.RecipeIngredientRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepo;

    private final CategoryRepository categoryRepo;
    
    private final RecipeIngredientRepository recipeRepo;
    private final com.restaurant.restaurant_management_Sys.repository.InventoryItemRepository inventoryRepo;

    @Cacheable("menuItems")
    public List<MenuRes> getAllMenuItems(){

        List<MenuItem> menuItems = menuRepo.findAll ();
        return menuItems.stream ()
                .filter(MenuItem::getActive)
                .map (menuItem -> new MenuRes (
                        menuItem.getId (),
                        menuItem.getName (),
                        menuItem.getDescription (),
                        menuItem.getCategory ().getName (),
                        menuItem.getPrice (),
                        menuItem.getAvailable (),
                        menuItem.getImageUrl()
                )).toList ();
    }

    @CacheEvict(value = "menuItems", allEntries = true)
    public String deleteMenuItem(Long id){
        MenuItem menuItem = menuRepo.findById (id)
                .orElseThrow (()->new RuntimeException ("Item not found"));

        menuItem.setActive(false);
        menuRepo.save(menuItem);
        return "Item was successfully deleted";
    }

    @CacheEvict(value = "menuItems", allEntries = true)
    public MenuRes addMenuItem(MenuReq request){

        if(menuRepo.existsByName (request.name ())){
            throw new RuntimeException ("The item is already present");
        }
        Category selectedCategory = categoryRepo.findByName (request.category ())
                .orElseThrow (()-> new RuntimeException ("Category not found, please create category at first"));

        MenuItem menuItem = MenuItem.builder ()
                .name (request.name ())
                .description (request.description ())
                .available (request.availability ())
                .price (request.price ())
                .imageUrl (request.imageUrl())
                .category (selectedCategory)
                .build ();
        MenuItem savedMenuItem = menuRepo.save (menuItem);

        return new MenuRes (
                savedMenuItem.getId (),
                savedMenuItem.getName (),
                savedMenuItem.getDescription (),
                savedMenuItem.getCategory ().getName (),
                savedMenuItem.getPrice (),
                savedMenuItem.getAvailable (),
                savedMenuItem.getImageUrl()
        );
    }

    @CacheEvict(value = "menuItems", allEntries = true)
    public MenuRes updateMenuItem(Long id, MenuReq request) {

        MenuItem menuItem = menuRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Menu item not found"));

        Category selectedCategory = categoryRepo.findByName(request.category())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        
        if (!menuItem.getName().equalsIgnoreCase(request.name())
                && menuRepo.existsByName(request.name())) {

            throw new RuntimeException(
                    request.name() + " is already present in the menu list!"
            );
        }

        menuItem.setName(request.name());
        menuItem.setDescription(request.description());
        menuItem.setCategory(selectedCategory);
        menuItem.setPrice(request.price());
        menuItem.setAvailable (request.availability());
        menuItem.setImageUrl (request.imageUrl());

        MenuItem savedItem = menuRepo.save(menuItem);

        return new MenuRes(
                savedItem.getId(),
                savedItem.getName(),
                savedItem.getDescription(),
                savedItem.getCategory().getName(),
                savedItem.getPrice(),
                savedItem.getAvailable (),
                savedItem.getImageUrl()
        );
    }

    public List<com.restaurant.restaurant_management_Sys.dto.response.RecipeIngredientRes> getRecipe(Long menuId) {
        MenuItem menuItem = menuRepo.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        return menuItem.getRecipeIngredients().stream()
                .map(this::mapRecipeIngredient)
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public List<com.restaurant.restaurant_management_Sys.dto.response.RecipeIngredientRes> updateRecipe(Long menuId, com.restaurant.restaurant_management_Sys.dto.request.RecipeReq req) {
        MenuItem menuItem = menuRepo.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        recipeRepo.deleteAll(menuItem.getRecipeIngredients());
        menuItem.getRecipeIngredients().clear();

        for (var ingredientReq : req.ingredients()) {
            com.restaurant.restaurant_management_Sys.entity.InventoryItem inventoryItem = inventoryRepo.findById(ingredientReq.inventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found"));
            
            com.restaurant.restaurant_management_Sys.entity.RecipeIngredient recipeIngredient = com.restaurant.restaurant_management_Sys.entity.RecipeIngredient.builder()
                    .menuItem(menuItem)
                    .inventoryItem(inventoryItem)
                    .quantityRequired(ingredientReq.quantityRequired())
                    .build();
            
            menuItem.getRecipeIngredients().add(recipeIngredient);
        }
        
        menuRepo.save(menuItem);
        return menuItem.getRecipeIngredients().stream()
                .map(this::mapRecipeIngredient)
                .toList();
    }

    private com.restaurant.restaurant_management_Sys.dto.response.RecipeIngredientRes mapRecipeIngredient(com.restaurant.restaurant_management_Sys.entity.RecipeIngredient ri) {
        return new com.restaurant.restaurant_management_Sys.dto.response.RecipeIngredientRes(
                ri.getId(),
                ri.getInventoryItem().getId(),
                ri.getInventoryItem().getItemName(),
                ri.getInventoryItem().getUnit(),
                ri.getQuantityRequired()
        );
    }
}
