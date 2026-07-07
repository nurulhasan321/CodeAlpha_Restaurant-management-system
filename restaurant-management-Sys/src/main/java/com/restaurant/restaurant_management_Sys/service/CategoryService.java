package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.CategoryReq;
import com.restaurant.restaurant_management_Sys.dto.response.CategoryRes;
import com.restaurant.restaurant_management_Sys.entity.Category;
import com.restaurant.restaurant_management_Sys.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepo;

    @CacheEvict(value = "categories", allEntries = true)
    public CategoryRes addCategory(CategoryReq request){
        if(categoryRepo.existsByName (request.name ())){
            throw new RuntimeException (request.name ()+" is already exists!");
        }
        Category category = Category.builder ()
                .name (request.name ())
                .description (request.description ())
                .status (request.status ())
                .build ();

        Category savedCategory = categoryRepo.save (category);
        return  new CategoryRes (
                savedCategory.getId (),
                savedCategory.getName (),
                savedCategory.getDescription (),
                savedCategory.getStatus (),
                savedCategory.getMenuItems () == null?0 :savedCategory.getMenuItems ().size ()
        );
    }

    @Cacheable("categories")
    public List<CategoryRes> getAllCategories(){
        List<Category> categories = categoryRepo.findAll ();

        return categories.stream ().map (category ->new CategoryRes (
                category.getId (),
                category.getName (),
                category.getDescription (),
                category.getStatus (),
                category.getMenuItems () == null?0:category.getMenuItems ().size ()
        )).toList ();
    }

    @CacheEvict(value = "categories", allEntries = true)
    public CategoryRes updateCategory(Long id, CategoryReq request){

        if(categoryRepo.existsByNameAndIdNot (request.name (),id)){
            throw new RuntimeException (request.name ()+" is already in the category list!");
        }

        Category category = categoryRepo.findById (id)
                .orElseThrow (()-> new RuntimeException ("Not found category"));

        category.setName (request.name ());
        category.setDescription (request.description ());
        category.setStatus (request.status ());

        Category savedCategory = categoryRepo.save (category);
        return new CategoryRes (
                savedCategory.getId (),
                savedCategory.getName (),
                savedCategory.getDescription (),
                savedCategory.getStatus (),
                savedCategory.getMenuItems ()==null?0:savedCategory.getMenuItems ().size ()
        );
    }

    @CacheEvict(value = "categories", allEntries = true)
    public String deleteCategory(Long id){

        Category category =  categoryRepo.findById (id)
                .orElseThrow (()->new RuntimeException ("Category not found"));

        categoryRepo.delete (category);

        return "Category was successfully deleted";
    }

}
