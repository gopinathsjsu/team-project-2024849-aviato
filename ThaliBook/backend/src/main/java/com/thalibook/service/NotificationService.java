package com.thalibook.service;

import com.thalibook.model.Notification;
import com.thalibook.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService; // from previous implementation

    public void notifyUser(Long userId, String email, String message) {
        // Save in-app notification
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notificationRepository.save(notification);

        // Send email
//        emailService.sendEmail(email, "Notification from ThaliBook", message);
    }
}

