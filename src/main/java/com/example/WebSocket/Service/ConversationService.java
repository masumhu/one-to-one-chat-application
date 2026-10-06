package com.example.WebSocket.Service;

import com.example.WebSocket.Entity.Conversation;
import com.example.WebSocket.Repository.ConversationRepository;
import com.example.WebSocket.Repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public ConversationService(
            ConversationRepository conversationRepository,
            UserRepository userRepository) {

        this.conversationRepository = conversationRepository;
        this.userRepository=userRepository;
    }

    public Conversation createConversation(
            String user1,
            String user2) {

        if (!userRepository.existsByEmail(user2)) {
            throw new RuntimeException("User not found");
        }

        return conversationRepository
                .findByUser1AndUser2(user1, user2)
                .or(()->
                        conversationRepository.findByUser2AndUser1(
                                user1,user2))
                .orElseGet(() -> {

                    Conversation conversation =
                            new Conversation();

                    conversation.setUser1(user1);
                    conversation.setUser2(user2);
                    conversation.setCreatedAt(
                            LocalDateTime.now()
                    );

                    return conversationRepository.save(
                            conversation
                    );
                });
    }

    public List<Conversation> getUserConversations(String email) {

        List<Conversation> conversations = new ArrayList<>();

        conversations.addAll(
                conversationRepository.findByUser1(email)
        );

        conversations.addAll(
                conversationRepository.findByUser2(email)
        );

        return conversations;
    }

    public Conversation getConversationById(String conversationId) {

        return conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new RuntimeException("Conversation not found"));
    }

    public boolean isUserPartOfConversation(
            Conversation conversation,
            String email) {

        return conversation.getUser1().equals(email)
                || conversation.getUser2().equals(email);
    }

    public boolean isValidMessageParticipant(
            String conversationId,
            String sender,
            String receiver) {

        Conversation conversation =
                getConversationById(conversationId);

        return conversation.getUser1().equals(sender)
                && conversation.getUser2().equals(receiver)

                || conversation.getUser2().equals(sender)
                && conversation.getUser1().equals(receiver);
    }
}