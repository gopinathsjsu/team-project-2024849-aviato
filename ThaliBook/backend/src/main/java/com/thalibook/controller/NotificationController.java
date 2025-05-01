package com.thalibook.controller;

import com.thalibook.exception.ResourceNotFoundException;
import com.thalibook.model.Notification;
import com.thalibook.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getMyNotifications(@RequestAttribute Map<String, Object> userDetails) {
        Long userId = ((Number) userDetails.get("userId")).longValue();
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<List<Notification>> markNotificationAsRead(@PathVariable Long id, @RequestAttribute Map<String, Object> userDetails) {
        Long userId = ((Number) userDetails.get("userId")).longValue();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(notificationRepository.findByUserIdAndReadFalse(userId));

    }
}
