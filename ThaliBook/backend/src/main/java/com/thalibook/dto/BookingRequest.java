package com.thalibook.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequest {
    private Long restaurantId;
    private LocalDate date;
    private LocalTime time;
    private int partySize;
}
