package com.example.WebSocket.Entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class ChatMessage {

    @Id
    private String id;

    private String conversationId;

    private String sender;

    private String receiver;

    private String content;

    private LocalDateTime timestamp;
}