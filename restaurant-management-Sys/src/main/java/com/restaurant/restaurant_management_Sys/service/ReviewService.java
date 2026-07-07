package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.ReviewReq;
import com.restaurant.restaurant_management_Sys.dto.response.ReviewRes;
import com.restaurant.restaurant_management_Sys.entity.Order;
import com.restaurant.restaurant_management_Sys.entity.Review;
import com.restaurant.restaurant_management_Sys.entity.User;
import com.restaurant.restaurant_management_Sys.repository.OrderRepository;
import com.restaurant.restaurant_management_Sys.repository.ReviewRepository;
import com.restaurant.restaurant_management_Sys.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ReviewRes addReview(ReviewReq req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(req.getOrderId()).orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only review your own orders");
        }

        if (reviewRepository.findByOrderId(order.getId()).isPresent()) {
            throw new RuntimeException("You have already reviewed this order");
        }

        Review review = Review.builder()
                .foodRating(req.getFoodRating())
                .deliveryRating(req.getDeliveryRating())
                .comment(req.getComment())
                .order(order)
                .user(user)
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    public List<ReviewRes> getMyReviews() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        return reviewRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReviewRes mapToResponse(Review review) {
        return ReviewRes.builder()
                .id(review.getId())
                .orderId(review.getOrder().getId())
                .foodRating(review.getFoodRating())
                .deliveryRating(review.getDeliveryRating())
                .comment(review.getComment())
                .userName(review.getUser().getName())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
