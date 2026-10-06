package com.example.WebSocket.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {

    @NotBlank(message = "Receiver is required")
    private String receiver;

    @NotBlank(message = "Message content is required")
    private String content;

    @NotBlank(message = "Conversation ID is required")
    private String conversationId;
}