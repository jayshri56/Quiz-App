package com.user.quiz_service.controller;

import com.user.quiz_service.entity.QuestionWrapper;
import com.user.quiz_service.entity.QuizDto;
import com.user.quiz_service.entity.Response;
import com.user.quiz_service.service.QuizService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@CrossOrigin("*")
@RequestMapping("quiz")
public class QuizController {

    @Autowired
    QuizService quizService;

    @PostMapping("create")
    public ResponseEntity<Integer> createQuiz(@RequestBody QuizDto quizDto) {
        return quizService.createQuiz(quizDto.getCategoryName(), quizDto.getNumQuestions(), quizDto.getTitle());
    }

    @GetMapping("get/{id}")
    public ResponseEntity<List<QuestionWrapper>> getQuestions(@PathVariable Integer id) {
        return quizService.getQuizQuestions(id);
    }

    @GetMapping("all")
    public ResponseEntity<List<com.user.quiz_service.entity.Quiz>> getAllQuizzes() {
        return quizService.getAllQuizzes();
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteQuiz(@PathVariable Integer id) {
        return quizService.deleteQuiz(id);
    }

    @PostMapping("submit/{id}")
    public ResponseEntity<Integer> submitQuiz(@PathVariable Integer id, @RequestBody List<Response> responses) {
        return quizService.calculateResult(id, responses);
    }

}
