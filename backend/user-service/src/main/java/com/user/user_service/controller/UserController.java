package com.user.user_service.controller;

import com.user.user_service.model.QuizResult;
import com.user.user_service.model.User;
import com.user.user_service.repository.ResultRepository;
import com.user.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("*")
@RequestMapping("/user")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    ResultRepository resultRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if(userRepository.findByUsername(user.getUsername()).isPresent()) {
            return new ResponseEntity<>("Username already exists", HttpStatus.BAD_REQUEST);
        }
        userRepository.save(user);
        return new ResponseEntity<>("Success", HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody User user) {
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if(existingUser.isPresent() && existingUser.get().getPassword().equals(user.getPassword())) {
            return new ResponseEntity<>(existingUser.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/result")
    public ResponseEntity<String> saveResult(@RequestBody QuizResult result) {
        result.setTimestamp(LocalDateTime.now());
        resultRepository.save(result);
        return new ResponseEntity<>("Result saved", HttpStatus.OK);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<QuizResult>> getHistory(@PathVariable Integer userId) {
        return new ResponseEntity<>(resultRepository.findByUserId(userId), HttpStatus.OK);
    }
}
