// Detection for deployment vs local
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const BASE_URL_QUIZ = `${API_BASE}/quiz`;
const BASE_URL_QUESTION = `${API_BASE}/question`;

export const quizApi = {
  createQuiz: async (categoryName, numQuestions, title) => {
    const response = await fetch(`${BASE_URL_QUIZ}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryName, numQuestions, title }),
    });
    if (!response.ok) throw new Error('Failed to create quiz');
    return response.json();
  },
  getAllQuizzes: async () => {
    const response = await fetch(`${BASE_URL_QUIZ}/all`);
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  },
  getQuizQuestions: async (id) => {
    const response = await fetch(`${BASE_URL_QUIZ}/get/${id}`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },
  deleteQuiz: async (id) => {
    const response = await fetch(`${BASE_URL_QUIZ}/delete/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete quiz');
    return response.text();
  },
  submitQuiz: async (id, responses) => {
    const response = await fetch(`${BASE_URL_QUIZ}/submit/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responses),
    });
    if (!response.ok) throw new Error('Failed to submit quiz');
    return response.json();
  },
};

export const questionApi = {
  getAllQuestions: async () => {
    const response = await fetch(`${BASE_URL_QUESTION}/allQuestions`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },
  addQuestion: async (questionData) => {
    const response = await fetch(`${BASE_URL_QUESTION}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    });
    if (!response.ok) throw new Error('Failed to add question');
    return response.text();
  },
  updateQuestion: async (id, questionData) => {
    const response = await fetch(`${BASE_URL_QUESTION}/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    });
    if (!response.ok) throw new Error('Failed to update question');
    return response.json();
  },
  deleteQuestion: async (id) => {
    const response = await fetch(`${BASE_URL_QUESTION}/delete/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete question');
    return response.text();
  },
};
