package com.user.quiz_service.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.user.quiz_service.Dao.QuizDao;
import com.user.quiz_service.entity.QuestionWrapper;
import com.user.quiz_service.entity.Quiz;
import com.user.quiz_service.entity.Response;
import com.user.quiz_service.feign.QuizInterface;

@Service
public class QuizService {

    @Autowired
    QuizDao quizDao;

    @Autowired
    QuizInterface quizInterface;

    // @Autowired
    // QuestionDao questionDao;

    public ResponseEntity<Integer> createQuiz(String category, int numQ, String title) {
        List<Integer> questions = quizInterface.getQuestionsForQuiz(category, numQ).getBody();
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setQuestionsId(questions);
        Quiz savedQuiz = quizDao.save(quiz);

        return new ResponseEntity<>(savedQuiz.getId(), HttpStatus.CREATED);
    }

    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(Integer id) {
        Quiz quiz = quizDao.findById(id).get();
        List<Integer> questionIds = quiz.getQuestionsId();
        ResponseEntity<List<QuestionWrapper>> questions = quizInterface.getQuestionsFromId(questionIds);
        return questions;
    }

    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return new ResponseEntity<>(quizDao.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<String> deleteQuiz(Integer id) {
        if (!quizDao.existsById(id)) {
            return new ResponseEntity<>("Quiz not found", HttpStatus.NOT_FOUND);
        }
        quizDao.deleteById(id);
        return new ResponseEntity<>("Quiz deleted", HttpStatus.OK);
    }

    public ResponseEntity<Integer> calculateResult(Integer id, List<Response> responses) {
     ResponseEntity<Integer>  score =quizInterface.getScore(responses); 

         return score;
    
    }

}
