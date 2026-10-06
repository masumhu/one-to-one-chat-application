package com.example.WebSocket.Controller;

import com.example.WebSocket.DTO.LoginRequest;
import com.example.WebSocket.DTO.RegisterRequest;
import com.example.WebSocket.DTO.UserResponse;
import com.example.WebSocket.Entity.User;
import com.example.WebSocket.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {

        User user = userService.registerUser(request);

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request) {

        return userService.loginUser(request);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }
}
