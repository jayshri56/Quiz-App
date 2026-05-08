import React, { useState, useEffect } from 'react';
import { quizApi, userApi } from './services/api';
import { Brain, Trophy, CheckCircle2, AlertCircle, Loader2, LogOut, User as UserIcon, History, Code2, Coffee, Globe, Database, Cpu, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOPICS = [
  { name: 'Java',       key: 'Java',       icon: Coffee,   color: '#f97316', bg: '#fff7ed',  border: '#fed7aa'  },
  { name: 'Python',     key: 'Python',     icon: Code2,    color: '#16a34a', bg: '#f0fdf4',  border: '#bbf7d0'  },
  { name: 'JavaScript', key: 'JavaScript', icon: Globe,    color: '#ca8a04', bg: '#fefce8',  border: '#fef08a'  },
  { name: 'SQL',        key: 'SQL',        icon: Database, color: '#2563eb', bg: '#eff6ff',  border: '#bfdbfe'  },
  { name: 'DSA',        key: 'DSA',        icon: Cpu,      color: '#9333ea', bg: '#faf5ff',  border: '#e9d5ff'  },
  { name: 'Spring',     key: 'Spring',     icon: Layers,   color: '#059669', bg: '#ecfdf5',  border: '#a7f3d0'  },
];

const App = () => {
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [topicLoading, setTopicLoading] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [currentTopic, setCurrentTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('logged_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setView('dashboard');
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const userData = {
      name: e.target.name.value,
      username: e.target.username.value,
      password: e.target.password.value
    };
    try {
      await userApi.register(userData);
      alert('Registration successful! Please login.');
      setView('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const credentials = {
      username: e.target.username.value,
      password: e.target.password.value
    };
    try {
      const user = await userApi.login(credentials);
      setCurrentUser(user);
      localStorage.setItem('logged_user', JSON.stringify(user));
      setView('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('logged_user');
    setView('login');
  };

  const startTopicQuiz = async (topic) => {
    setTopicLoading(topic.key);
    setError(null);
    try {
      const quizId = await quizApi.createQuiz(topic.key, 5, `${topic.name} Quiz`);
      const data = await quizApi.getQuizQuestions(quizId);
      setQuestions(data);
      setCurrentQuizId(quizId);
      setCurrentTopic(topic.name);
      setCurrentQuestionIndex(0);
      setResponses([]);
      setView('play');
    } catch (err) {
      setError(`Failed to start ${topic.name} quiz. Make sure questions exist for this topic.`);
    } finally {
      setTopicLoading(null);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const finalScore = await quizApi.submitQuiz(currentQuizId, responses);
      setScore(finalScore);
      await userApi.saveResult({
        userId: currentUser.id,
        quizTitle: `${currentTopic} Quiz`,
        score: finalScore,
        totalQuestions: questions.length
      });
      setView('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await userApi.getHistory(currentUser.id);
      setHistory(data);
      setView('history');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAnswered = (index) => {
    const qId = questions[index]?.id;
    return responses.some(r => r.id === qId);
  };

  const handleSelectOption = (option) => {
    const qId = questions[currentQuestionIndex].id;
    const newResponses = [...responses];
    const existing = newResponses.findIndex(r => r.id === qId);
    if (existing > -1) newResponses[existing].response = option;
    else newResponses.push({ id: qId, response: option });
    setResponses(newResponses);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Header */}
      <header style={{ marginBottom: '2rem', width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => currentUser && setView('dashboard')}>
          <div style={{ padding: '0.5rem', background: '#f5f3ff', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
            <Brain style={{ width: 28, height: 28, color: '#6366f1' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg,#1e293b,#64748b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            QuizMaster
          </h1>
        </div>

        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserIcon style={{ width: 16, height: 16, color: '#818cf8' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currentUser.name}</span>
            </div>
            <button
              onClick={fetchHistory}
              style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#6366f1', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <History style={{ width: 16, height: 16, display: 'inline', marginRight: 4 }} /> History
            </button>
            <button onClick={handleLogout} style={{ padding: '0.5rem', color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <LogOut style={{ width: 20, height: 20 }} />
            </button>
          </div>
        )}
      </header>

      <main style={{ width: '100%', maxWidth: '1100px' }}>
        <AnimatePresence mode="wait">

          {/* LOGIN */}
          {view === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card" style={{ maxWidth: 420, margin: '0 auto' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h2>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input name="username" type="text" placeholder="Username" style={{ width: '100%' }} required />
                <input name="password" type="password" placeholder="Password" style={{ width: '100%' }} required />
                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite', margin: '0 auto' }} /> : 'Login'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setError(null); setView('register'); }} style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Register</button>
                </p>
              </form>
            </motion.div>
          )}

          {/* REGISTER */}
          {view === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card" style={{ maxWidth: 420, margin: '0 auto' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input name="name" type="text" placeholder="Full Name" style={{ width: '100%' }} required />
                <input name="username" type="text" placeholder="Username" style={{ width: '100%' }} required />
                <input name="password" type="password" placeholder="Password" style={{ width: '100%' }} required />
                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite', margin: '0 auto' }} /> : 'Register'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setError(null); setView('login'); }} style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Login</button>
                </p>
              </form>
            </motion.div>
          )}

          {/* DASHBOARD */}
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Choose a Topic</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Select a subject to start a quiz instantly</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {TOPICS.map((topic) => {
                  const Icon = topic.icon;
                  const isLoading = topicLoading === topic.key;
                  return (
                    <motion.button
                      key={topic.key}
                      onClick={() => !topicLoading && startTopicQuiz(topic)}
                      whileHover={{ scale: 1.03, translateY: -4 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!!topicLoading}
                      style={{
                        background: topic.bg,
                        border: `1px solid ${topic.border}`,
                        borderRadius: 20,
                        padding: '1.75rem',
                        cursor: topicLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        textAlign: 'left',
                        opacity: topicLoading && !isLoading ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${topic.color}22`, border: `1px solid ${topic.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isLoading
                          ? <Loader2 style={{ width: 28, height: 28, color: topic.color, animation: 'spin 1s linear infinite' }} />
                          : <Icon style={{ width: 28, height: 28, color: topic.color }} />
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{topic.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>5 Questions · ~5 min</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PLAY */}
          {view === 'play' && questions.length > 0 && (
            <motion.div key="play" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

              {/* --- LEFT SIDEBAR --- */}
              <div className="glass-card" style={{ padding: '1.25rem', minWidth: 130, flexShrink: 0 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>Questions</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {questions.map((_, idx) => {
                    const answered = isAnswered(idx);
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          border: isCurrent ? '2px solid #818cf8' : '2px solid transparent',
                          background: answered ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)',
                          color: answered ? '#4ade80' : '#f87171',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isCurrent ? '0 0 0 2px rgba(129,140,248,0.4)' : 'none',
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                {/* Legend */}
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#16a34a' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: '#dcfce7' }} /> Answered
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#dc2626' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: '#fee2e2' }} /> Not Yet
                  </div>
                </div>
              </div>

              {/* --- MAIN QUESTION AREA --- */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Progress bar */}
                <div className="glass-card" style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Brain style={{ width: 18, height: 18, color: '#818cf8' }} />
                      <span style={{ fontWeight: 700 }}>{currentTopic} Quiz</span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {currentQuestionIndex + 1} / {questions.length} &nbsp;·&nbsp; {responses.length} answered
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#ec4899)', borderRadius: 999 }}
                    />
                  </div>
                </div>

                {/* Question Card */}
                <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'linear-gradient(180deg,#6366f1,#ec4899)' }} />
                  <div style={{ paddingLeft: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Question {currentQuestionIndex + 1}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                      {questions[currentQuestionIndex].questionTitle}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        questions[currentQuestionIndex].option1,
                        questions[currentQuestionIndex].option2,
                        questions[currentQuestionIndex].option3,
                        questions[currentQuestionIndex].option4
                      ].map((option, idx) => {
                        const isSelected = responses.find(r => r.id === questions[currentQuestionIndex].id)?.response === option;
                        return (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleSelectOption(option)}
                            style={{
                              textAlign: 'left',
                              padding: '1rem 1.25rem',
                              borderRadius: 14,
                              border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                              background: isSelected ? '#f5f3ff' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                              background: isSelected ? '#ddd6fe' : '#f8fafc',
                              border: isSelected ? '1px solid #6366f1' : '1px solid #e2e8f0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.875rem',
                              color: isSelected ? '#6366f1' : '#64748b'
                            }}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span style={{ fontSize: '1rem', color: isSelected ? '#1e293b' : '#334155', flex: 1 }}>{option}</span>
                            {isSelected && <CheckCircle2 style={{ width: 20, height: 20, color: '#6366f1', flexShrink: 0 }} />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(p => p - 1)}
                  >
                    ← Previous
                  </button>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button className="btn-primary" style={{ flex: 1 }} onClick={submitQuiz} disabled={loading}>
                      {loading ? <Loader2 style={{ width: 18, height: 18, display: 'inline', animation: 'spin 1s linear infinite' }} /> : '✓ Submit Quiz'}
                    </button>
                  ) : (
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => setCurrentQuestionIndex(p => p + 1)}>
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {view === 'result' && (
            <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card" style={{ textAlign: 'center', maxWidth: 420, margin: '0 auto' }}>
              <Trophy style={{ width: 72, height: 72, color: '#facc15', margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quiz Complete!</h2>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{currentTopic} Quiz</p>
              <div style={{ fontSize: '4rem', fontWeight: 800, color: '#818cf8', marginBottom: '0.5rem' }}>
                {score}<span style={{ fontSize: '1.5rem', color: '#64748b' }}>/{questions.length}</span>
              </div>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                {Math.round((score / questions.length) * 100)}% Score
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setView('dashboard')}>Home</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={fetchHistory}>View History</button>
              </div>
            </motion.div>
          )}

          {/* HISTORY */}
          {view === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card" style={{ maxWidth: 700, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Performance History</h2>
                <button onClick={() => setView('dashboard')} style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
              </div>
              {history.length === 0
                ? <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem 0' }}>No quizzes played yet.</p>
                : history.map(h => (
                  <div key={h.id} style={{
                    padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: 14,
                    border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '0.75rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>{h.quizTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(h.timestamp).toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{h.score} / {h.totalQuestions}</div>
                  </div>
                ))
              }
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {error && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(12px)', color: 'white',
          padding: '0.75rem 1.5rem', borderRadius: 999, display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 8px 32px rgba(239,68,68,0.3)', zIndex: 1000, maxWidth: '90vw'
        }}>
          <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem' }}>{error}</span>
          <button onClick={() => setError(null)} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>×</button>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
