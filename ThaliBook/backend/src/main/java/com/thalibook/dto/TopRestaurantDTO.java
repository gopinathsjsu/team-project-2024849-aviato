package com.thalibook.dto;

public class TopRestaurantDTO {
    private Long restaurantId;
    private Long bookingCount;

    public TopRestaurantDTO(Long restaurantId, Long bookingCount) {
        this.restaurantId = restaurantId;
        this.bookingCount = bookingCount;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public Long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(Long bookingCount) {
        this.bookingCount = bookingCount;
    }
}
