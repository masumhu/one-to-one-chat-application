package com.example.WebSocket.Controller;

import com.example.WebSocket.DTO.ConversationRequest;
import com.example.WebSocket.Entity.Conversation;
import com.example.WebSocket.Service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping("/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(
            ConversationService conversationService) {

        this.conversationService = conversationService;
    }

    @PostMapping
    public Conversation createConversation(
            @Valid
            @RequestBody ConversationRequest request,
            Principal principal) {

        return conversationService.createConversation(
                principal.getName(),
                request.getUser2()
        );
    }

    @GetMapping
    public List<Conversation> getConversations(
            Principal principal) {

        return conversationService.getUserConversations(
                principal.getName()
        );
    }
}