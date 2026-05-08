package com.user.question_service.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.user.question_service.Dao.QuestionDao;
import com.user.question_service.entity.Question;
import com.user.question_service.entity.QuestionWrapper;
import com.user.question_service.entity.Response;

@Service
public class QuestionService {

	@Autowired
	QuestionDao questionDao;

	public ResponseEntity<List<Question>> getAllQuestions() {

		try {
			return new ResponseEntity<>(questionDao.findAll(), HttpStatus.OK);

		} catch (Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity<>(new ArrayList<>(), HttpStatus.BAD_REQUEST);

	}

	public ResponseEntity<List<Question>> getQuestionByCategory(String category) {
		try {
			return new ResponseEntity<>(questionDao.findByCategory(category), HttpStatus.OK);

		} catch (Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity<>(new ArrayList<>(), HttpStatus.BAD_REQUEST);
	}

	public Optional<Question> getQuestionById(Integer id) {
		return questionDao.findById(id);
	}

	public ResponseEntity<String> addQuestions(Question question) {
		// TODO Auto-generated method stub
		questionDao.save(question);
		return new ResponseEntity<>("Success", HttpStatus.CREATED);
	}

	public String deleteQuestion(Integer id) {
		questionDao.deleteById(id);
		return "Successfully deleted";
	}

	public ResponseEntity<Question> updateQuestion(Integer id, Question updated) {
		Optional<Question> existing = questionDao.findById(id);
		if (existing.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		updated.setId(id);
		return new ResponseEntity<>(questionDao.save(updated), HttpStatus.OK);
	}

	public ResponseEntity<List<Integer>> getQuestionsForQuiz(String categoryName, Integer numQuestions) {
		List<Integer> questions = questionDao.findRandomQuestionCategory(categoryName, numQuestions);
		return new ResponseEntity<>(questions, HttpStatus.OK);
	}

	public ResponseEntity<List<QuestionWrapper>> getQuestionsFromId(List<Integer> questionIds) {
		// TODO Auto-generated method stub

		List<QuestionWrapper> wrappers = new ArrayList<>();
		List<Question> questions = new ArrayList<>();

		for (Integer id : questionIds) {
			questions.add(questionDao.findById(id).get());
		}

		for (Question question : questions) {
			QuestionWrapper wrapper = new QuestionWrapper(null, null, null, null, null, null);
			wrapper.setId(question.getId());
			wrapper.setQuestionTitle(question.getQuestionTitle());
			wrapper.setOption1(question.getOption1());
			wrapper.setOption2(question.getOption2());
			wrapper.setOption3(question.getOption3());
			wrapper.setOption4(question.getOption4());
			wrappers.add(wrapper);

		}
		return new ResponseEntity<>(wrappers, HttpStatus.OK);
	}

	// public → accessible from anywhere.
	// ResponseEntity<Integer> → returns an HTTP response containing an Integer
	// score.
	// getScore(...) → method name.
	// List<Response> responses → accepts a list of answers submitted by the user.

	public ResponseEntity<Integer> getScore(List<Response> responses) {
		// Creates a counter variable.
		// Stores how many answers are correct.
		int right = 0;

		for (Response response : responses) {
			Question question = questionDao.findById(response.getId()).get();
			if (response.getResponse().equals(question.getRightAnswer())) {
				right++;

			}
		}
		return new ResponseEntity<>(right, HttpStatus.OK);

	}

}
