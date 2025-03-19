package com.thalibook.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tables_availability")
@Getter
@Setter
public class TablesAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "table_id")
    private Long tableId;

    @Column(name = "restaurant_id")
    private Long restaurantId;

    @Column(nullable = false)
    private Integer size;

    @Column(name = "booking_times", columnDefinition = "json", nullable = false)
    private String bookingTimes; // store as JSON string like '["12:00", "12:30"]'
}

