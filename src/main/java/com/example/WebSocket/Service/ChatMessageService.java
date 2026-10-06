package com.example.WebSocket.Service;

import com.example.WebSocket.Entity.ChatMessage;
import com.example.WebSocket.Entity.Conversation;
import com.example.WebSocket.Repository.ChatMessageRepository;
import com.example.WebSocket.Repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ConversationService conversationService;

    public ChatMessageService(
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository,
            ConversationService conversationService) {

        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.conversationService = conversationService;
    }

    public ChatMessage saveMessage(ChatMessage message) {

        if (!userRepository.existsByEmail(message.getReceiver())) {
            throw new RuntimeException("Receiver not found");
        }

        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getConversationMessages(
            String conversationId,
            String email) {

        Conversation conversation =
                conversationService.getConversationById(conversationId);

        if (!conversationService.isUserPartOfConversation(
                conversation,
                email)) {

            throw new RuntimeException(
                    "You are not part of this conversation"
            );
        }

        return chatMessageRepository
                .findByConversationIdOrderByTimestampAsc(
                        conversationId
                );
    }
}