package com.user.quiz_service.Dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.user.quiz_service.entity.Quiz;

@Repository
public interface QuizDao extends JpaRepository<Quiz, Integer> {

}
