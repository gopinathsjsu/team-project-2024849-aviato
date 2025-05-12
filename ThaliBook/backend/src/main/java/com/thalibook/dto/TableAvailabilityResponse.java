package com.thalibook.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TableAvailabilityResponse {
    private Long tableId;
    private int size;
    private List<String> availableTimes;
}

