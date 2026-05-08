// Detection for deployment vs local
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const BASE_URL_QUIZ = `${API_BASE}/quiz`;
const BASE_URL_QUESTION = `${API_BASE}/question`;
const BASE_URL_USER = `${API_BASE}/user`;

export const quizApi = {
  createQuiz: async (categoryName, numQuestions, title) => {
    const response = await fetch(`${BASE_URL_QUIZ}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryName, numQuestions, title }),
    });
    if (!response.ok) throw new Error('Failed to create quiz');
    return response.json(); // returns the new quiz ID as an integer
  },
  getQuizQuestions: async (id) => {
    const response = await fetch(`${BASE_URL_QUIZ}/get/${id}`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
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
  deleteQuestion: async (id) => {
    const response = await fetch(`${BASE_URL_QUESTION}/delete/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete question');
    return response.text();
  },
};

export const userApi = {
  register: async (userData) => {
    const response = await fetch(`${BASE_URL_USER}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.text();
  },
  login: async (credentials) => {
    const response = await fetch(`${BASE_URL_USER}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  saveResult: async (resultData) => {
    const response = await fetch(`${BASE_URL_USER}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData),
    });
    if (!response.ok) throw new Error('Failed to save result');
    return response.text();
  },
  getHistory: async (userId) => {
    const response = await fetch(`${BASE_URL_USER}/history/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },
};
