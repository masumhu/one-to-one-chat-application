package com.example.WebSocket.Controller;

import com.example.WebSocket.DTO.ChatMessageRequest;
import com.example.WebSocket.Entity.ChatMessage;
import com.example.WebSocket.Service.ChatMessageService;
import com.example.WebSocket.Service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.security.Principal;
import java.time.LocalDateTime;

@Controller
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationService conversationService;

    public ChatController(
            ChatMessageService chatMessageService,
            SimpMessagingTemplate messagingTemplate,
            ConversationService conversationService) {

        this.chatMessageService = chatMessageService;
        this.messagingTemplate = messagingTemplate;
        this.conversationService=conversationService;
    }

    @MessageMapping("/chat")
    public void sendMessage(@Valid
            ChatMessageRequest request,
            Principal principal) {

        if (!conversationService.isValidMessageParticipant(
                request.getConversationId(),
                principal.getName(),
                request.getReceiver())) {

            throw new RuntimeException(
                    "Sender and receiver are not part of this conversation"
            );
        }

        ChatMessage message = new ChatMessage();

        message.setSender(principal.getName());
        message.setReceiver(request.getReceiver());
        message.setContent(request.getContent());
        message.setConversationId(request.getConversationId());
        message.setTimestamp(LocalDateTime.now());

        ChatMessage savedMessage =
                chatMessageService.saveMessage(message);

        messagingTemplate.convertAndSendToUser(
                request.getReceiver(),
                "/queue/messages",
                savedMessage
        );
    }
    @GetMapping("/conversations/{conversationId}/messages")
    @ResponseBody
    public List<ChatMessage> getConversationMessages(
            @PathVariable String conversationId,
            Principal principal) {

        return chatMessageService.getConversationMessages(
                conversationId,
                principal.getName()
        );
    }
}