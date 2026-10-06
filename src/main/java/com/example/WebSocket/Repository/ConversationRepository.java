package com.example.WebSocket.Repository;

import com.example.WebSocket.Entity.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository
        extends MongoRepository<Conversation, String> {

    Optional<Conversation> findByUser1AndUser2(
            String user1,
            String user2
    );

    Optional<Conversation> findByUser2AndUser1(
            String user1,
            String user2
    );

    List<Conversation> findByUser1(String user1);

    List<Conversation> findByUser2(String user2);
}