package com.thalibook.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class GeoCodingService {

    @Value("${mapbox.api.token}")
    private String mapboxToken;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public double[] getLatLong(String fullAddress, String zipCode) throws IOException {
        try {
            return tryGeocode(fullAddress);
        } catch (IOException e) {
            System.err.println("⚠️ Failed to geocode full address. Falling back to ZIP code.");
            return tryGeocode(zipCode);
        }
    }

    private double[] tryGeocode(String location) throws IOException {
        String encoded = URLEncoder.encode(location, StandardCharsets.UTF_8);
        String url = String.format(
                "https://api.mapbox.com/geocoding/v5/mapbox.places/%s.json?access_token=%s",
                encoded, mapboxToken
        );

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = objectMapper.readTree(response.body());
            JsonNode coords = json.at("/features/0/center");

            if (coords.isArray() && coords.size() == 2) {
                double lng = coords.get(0).asDouble(); // [longitude, latitude]
                double lat = coords.get(1).asDouble();
                return new double[]{lat, lng};
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Interrupted while calling Mapbox API", e);
        }

        throw new IOException("No coordinates found for: " + location);
    }

}

