package com.user.user_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class QuizResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer userId;
    private String quizTitle;
    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime timestamp;
}
