package com.thalibook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.util.Map;

@Data
public class CreateRestaurantRequest {

        @NotBlank
        private String name;

        @NotBlank
        private String address;

        @NotBlank
        private String city;

        @Size(min = 2, max = 2)
        private String state;

        @Pattern(regexp = "\\d{5}")
        private String zipCode;

        @Pattern(regexp = "\\d{3}-\\d{4}")
        private String phone;

        @NotBlank
        private String description;

        @NotBlank
        private String cuisine;

        @Pattern(regexp = "[$]{1,3}") // $, $$, or $$$
        private String costRating;

        @NotNull
        private Map<String, String> hours;

        @URL
        private String photoUrl;

        private Double latitude;

        private Double longitude;

        private Map<Integer, Integer> tables;
}
