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

    @Column(name = "booking_times", nullable = false)
    private String bookingTimes; // now treated as plain text (stores JSON array as a string)

}

