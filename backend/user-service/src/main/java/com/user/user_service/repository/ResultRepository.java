package com.user.user_service.repository;

import com.user.user_service.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResultRepository extends JpaRepository<QuizResult, Integer> {
    List<QuizResult> findByUserId(Integer userId);
}
