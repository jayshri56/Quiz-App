package com.user.question_service.Dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.user.question_service.entity.Question;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionDao extends JpaRepository<Question, Integer> {

    List<Question> findByCategory(String category);

    Optional<Question> findById(Integer id);

    @Query(value = "select q.id from question q where q.category=:category order by random() limit :num", nativeQuery = true)
    List<Integer> findRandomQuestionCategory(String category, int num);

}
