package com.thalibook.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@Setter
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column( name = "review_id" )
    private Long reviewId;

    //Foreign Key maps to the restaurant table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    //Foreign Key maps to the user table
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column( name = "rating" )
    private int rating;

    @Column( nullable = false, length = 400 )
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
