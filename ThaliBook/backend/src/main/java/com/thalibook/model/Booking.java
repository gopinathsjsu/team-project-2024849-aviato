package com.thalibook.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    private Long userId;
    private Long restaurantId;
    private Long tableId;

    private LocalDate date;
    private LocalTime time;

    private Integer partySize;
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

