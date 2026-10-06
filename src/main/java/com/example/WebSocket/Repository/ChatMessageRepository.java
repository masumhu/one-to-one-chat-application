package com.example.WebSocket.Repository;

import com.example.WebSocket.Entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {


    List<ChatMessage> findByConversationIdOrderByTimestampAsc(
            String conversationId
    );
}