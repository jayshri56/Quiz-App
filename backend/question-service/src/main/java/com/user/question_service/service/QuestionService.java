package com.user.question_service.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
		List<Question> questions = questionDao.findAllById(questionIds);
		List<QuestionWrapper> wrappers = new ArrayList<>();

		for (Question question : questions) {
			QuestionWrapper wrapper = new QuestionWrapper();
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

	public ResponseEntity<Integer> getScore(List<Response> responses) {
		List<Integer> ids = new ArrayList<>();
		for (Response r : responses) ids.add(r.getId());
		
		List<Question> questions = questionDao.findAllById(ids);
		Map<Integer, String> answers = new HashMap<>();
		for (Question q : questions) answers.put(q.getId(), q.getRightAnswer());

		int right = 0;
		for (Response response : responses) {
			String correct = answers.get(response.getId());
			if (correct != null && response.getResponse().equals(correct)) {
				right++;
			}
		}
		return new ResponseEntity<>(right, HttpStatus.OK);
	}

}
