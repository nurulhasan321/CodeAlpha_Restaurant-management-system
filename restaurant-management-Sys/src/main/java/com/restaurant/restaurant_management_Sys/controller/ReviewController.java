package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.ReviewReq;
import com.restaurant.restaurant_management_Sys.dto.response.ReviewRes;
import com.restaurant.restaurant_management_Sys.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewRes> addReview(@Valid @RequestBody ReviewReq req) {
        return ResponseEntity.ok(reviewService.addReview(req));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReviewRes>> getMyReviews() {
        return ResponseEntity.ok(reviewService.getMyReviews());
    }
}
