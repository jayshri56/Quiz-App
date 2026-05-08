import React, { useState, useEffect, useRef } from 'react';
import { quizApi, questionApi } from './services/api';
import { Brain, ShieldCheck, PlusCircle, Trash2, Loader2, AlertCircle, Edit2, Search, X, BookOpen, Database, List, LogOut, Upload, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Java', 'Python', 'JavaScript', 'SQL', 'DSA', 'Spring'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFF_COLOR = { Easy: '#22c55e', Medium: '#eab308', Hard: '#ef4444' };
const CAT_COLOR = { Java:'#f97316', Python:'#22c55e', JavaScript:'#eab308', SQL:'#3b82f6', DSA:'#a855f7', Spring:'#10b981' };

const EMPTY_Q = { questionTitle:'', option1:'', option2:'', option3:'', option4:'', rightAnswer:'', category:'Java', difficultyLevel:'Easy' };

const S = {
  card: { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:20, padding:'1.5rem', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' },
  input: { background:'#ffffff', border:'1px solid #e2e8f0', color:'#1e293b', padding:'0.65rem 0.9rem', borderRadius:10, outline:'none', width:'100%', fontSize:'0.9rem' },
  btn: { background:'linear-gradient(135deg,#6366f1,#ec4899)', color:'#fff', border:'none', padding:'0.65rem 1.5rem', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:'0.875rem', boxShadow:'0 4px 15px rgba(99,102,241,0.2)' },
  btnSec: { background:'#ffffff', color:'#64748b', border:'1px solid #e2e8f0', padding:'0.65rem 1.5rem', borderRadius:10, fontWeight:600, cursor:'pointer', fontSize:'0.875rem' },
  label: { fontSize:'0.75rem', color:'#64748b', fontWeight:600, display:'block', marginBottom:4 },
  tag: (c) => ({ background:`${c}15`, color:c, border:`1px solid ${c}30`, padding:'2px 10px', borderRadius:999, fontSize:'0.7rem', fontWeight:700, display:'inline-block' }),
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.4)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
    <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} style={{ ...S.card, width:'100%', maxWidth:640, maxHeight:'90vh', overflowY:'auto', border:'none', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <h3 style={{ fontWeight:700, fontSize:'1.2rem', color:'#1e293b' }}>{title}</h3>
        <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', color:'#64748b', cursor:'pointer', padding:'4px', borderRadius:'6px' }}><X size={20} /></button>
      </div>
      {children}
    </motion.div>
  </div>
);

const QuestionForm = ({ initial, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial || EMPTY_Q);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
      <div style={{ gridColumn:'1/-1' }}>
        <label style={S.label}>Question</label>
        <textarea value={form.questionTitle} onChange={e => set('questionTitle', e.target.value)} required rows={3} style={{ ...S.input, resize:'vertical' }} />
      </div>
      {['option1','option2','option3','option4'].map((o,i) => (
        <div key={o}>
          <label style={S.label}>Option {i+1}</label>
          <input style={S.input} value={form[o]} onChange={e => set(o, e.target.value)} required />
        </div>
      ))}
      <div>
        <label style={S.label}>Correct Answer</label>
        <select style={S.input} value={form.rightAnswer} onChange={e => set('rightAnswer', e.target.value)} required>
          <option value="">Select...</option>
          {[form.option1, form.option2, form.option3, form.option4].filter(Boolean).map((o,i) => <option key={i} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label style={S.label}>Category</label>
        <select style={S.input} value={form.category} onChange={e => set('category', e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ gridColumn:'1/-1' }}>
        <label style={S.label}>Difficulty</label>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          {DIFFICULTIES.map(d => (
            <button type="button" key={d} onClick={() => set('difficultyLevel', d)}
              style={{ flex:1, padding:'0.5rem', borderRadius:8, border:`2px solid ${form.difficultyLevel === d ? DIFF_COLOR[d] : 'rgba(255,255,255,0.1)'}`, background: form.difficultyLevel === d ? `${DIFF_COLOR[d]}22` : 'transparent', color: form.difficultyLevel === d ? DIFF_COLOR[d] : '#64748b', fontWeight:700, cursor:'pointer', fontSize:'0.875rem' }}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div style={{ gridColumn:'1/-1', display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
        <button type="button" style={{ ...S.btnSec, flex:1 }} onClick={onCancel}>Cancel</button>
        <button type="submit" style={{ ...S.btn, flex:1 }} disabled={loading}>
          {loading ? <Loader2 style={{ width:16, height:16, display:'inline', animation:'spin 1s linear infinite' }} /> : 'Save Question'}
        </button>
      </div>
    </form>
  );
};

export default function App() {
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterDiff, setFilterDiff] = useState('All');
  const [editQ, setEditQ] = useState(null);
  const [showAddQ, setShowAddQ] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({ title:'', category:'Java', numQuestions:5 });
  const [activeTab, setActiveTab] = useState('questions');
  const fileRef = useRef();

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === '1') setView('dashboard');
  }, []);

  useEffect(() => {
    if (view === 'dashboard') { fetchQuestions(); fetchQuizzes(); }
  }, [view]);

  const notify = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => isErr ? setError(null) : setSuccess(null), 3500);
  };

  const fetchQuestions = async () => {
    try { setQuestions(await questionApi.getAllQuestions()); } catch (e) { notify(e.message, true); }
  };
  const fetchQuizzes = async () => {
    try { setQuizzes(await quizApi.getAllQuizzes()); } catch (e) { notify(e.message, true); }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (e.target.username.value === 'admin' && e.target.password.value === 'admin123') {
      localStorage.setItem('admin_auth', '1');
      setView('dashboard');
    } else notify('Invalid credentials', true);
  };
  const logout = () => { localStorage.removeItem('admin_auth'); setView('login'); };

  const handleAddQ = async (form) => {
    setLoading(true);
    try { await questionApi.addQuestion(form); notify('Question added!'); setShowAddQ(false); fetchQuestions(); }
    catch (e) { notify(e.message, true); } finally { setLoading(false); }
  };
  const handleUpdateQ = async (form) => {
    setLoading(true);
    try { await questionApi.updateQuestion(editQ.id, form); notify('Question updated!'); setEditQ(null); fetchQuestions(); }
    catch (e) { notify(e.message, true); } finally { setLoading(false); }
  };
  const handleDeleteQ = async (id) => {
    if (!confirm('Delete this question?')) return;
    try { await questionApi.deleteQuestion(id); notify('Deleted!'); fetchQuestions(); }
    catch (e) { notify(e.message, true); }
  };
  const handleCreateQuiz = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await quizApi.createQuiz(quizForm.category, quizForm.numQuestions, quizForm.title); notify('Quiz created!'); setShowAddQuiz(false); fetchQuizzes(); }
    catch (e) { notify(e.message, true); } finally { setLoading(false); }
  };
  const handleDeleteQuiz = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    try { await quizApi.deleteQuiz(id); notify('Quiz deleted!'); fetchQuizzes(); }
    catch (e) { notify(e.message, true); }
  };

  const handleCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = ev.target.result.trim().split('\n').slice(1);
      let added = 0;
      for (const line of lines) {
        const [questionTitle, option1, option2, option3, option4, rightAnswer, category, difficultyLevel] = line.split(',').map(s => s.trim());
        if (!questionTitle) continue;
        try { await questionApi.addQuestion({ questionTitle, option1, option2, option3, option4, rightAnswer, category: category || 'Java', difficultyLevel: difficultyLevel || 'Easy' }); added++; }
        catch {}
      }
      notify(`Imported ${added} questions!`); fetchQuestions();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filtered = questions.filter(q =>
    (filterCat === 'All' || q.category === filterCat) &&
    (filterDiff === 'All' || q.difficultyLevel === filterDiff) &&
    (q.questionTitle?.toLowerCase().includes(search.toLowerCase()))
  );

  // Stats
  const catCounts = CATEGORIES.map(c => ({ cat: c, count: questions.filter(q => q.category === c).length }));
  const maxCount = Math.max(...catCounts.map(x => x.count), 1);

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', backgroundImage:'radial-gradient(at 0% 0%,rgba(99,102,241,0.05) 0,transparent 50%),radial-gradient(at 100% 0%,rgba(236,72,153,0.05) 0,transparent 50%)', color:'#1e293b', fontFamily:"'Outfit',sans-serif", padding:'0 1rem' }}>

      {/* HEADER */}
      <header style={{ maxWidth:1200, margin:'0 auto', padding:'1.25rem 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ padding:'0.5rem', background:'#f5f3ff', borderRadius:12, border:'1px solid #ddd6fe' }}>
            <Brain style={{ width:26, height:26, color:'#6366f1' }} />
          </div>
          <span style={{ fontSize:'1.5rem', fontWeight:800, background:'linear-gradient(135deg,#1e293b,#64748b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>QuizMaster Admin</span>
        </div>
        {view === 'dashboard' && (
          <button onClick={logout} style={{ ...S.btnSec, display:'flex', alignItems:'center', gap:'0.4rem' }}>
            <LogOut style={{ width:15, height:15 }} /> Logout
          </button>
        )}
      </header>

      <main style={{ maxWidth:1200, margin:'0 auto', paddingBottom:'4rem' }}>
        <AnimatePresence mode="wait">

          {/* LOGIN */}
          {view === 'login' && (
            <motion.div key="login" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ ...S.card, maxWidth:420, margin:'4rem auto' }}>
              <div style={{ textAlign:'center', marginBottom:'2rem' }}>
                <ShieldCheck style={{ width:56, height:56, color:'#6366f1', margin:'0 auto 1rem' }} />
                <h2 style={{ fontSize:'1.5rem', fontWeight:700 }}>Admin Portal</h2>
                <p style={{ color:'#64748b', fontSize:'0.875rem', marginTop:4 }}>Sign in to manage questions and quizzes</p>
              </div>
              <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div><label style={S.label}>Username</label><input name="username" style={S.input} required /></div>
                <div><label style={S.label}>Password</label><input name="password" type="password" style={S.input} required /></div>
                <button type="submit" style={{ ...S.btn, marginTop:'0.5rem' }}>Login</button>
              </form>
            </motion.div>
          )}

          {/* DASHBOARD */}
          {view === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity:0 }} animate={{ opacity:1 }}>

              {/* STAT CARDS */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', margin:'1.5rem 0' }}>
                {[
                  { label:'Total Questions', value:questions.length, color:'#818cf8', icon:<Database style={{ width:20, height:20 }} /> },
                  { label:'Total Quizzes', value:quizzes.length, color:'#ec4899', icon:<List style={{ width:20, height:20 }} /> },
                  { label:'Categories', value:catCounts.filter(c=>c.count>0).length, color:'#22c55e', icon:<BookOpen style={{ width:20, height:20 }} /> },
                ].map(s => (
                  <div key={s.label} style={{ ...S.card, display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}22`, border:`1px solid ${s.color}44`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}>{s.icon}</div>
                    <div><div style={{ fontSize:'1.75rem', fontWeight:800, color:s.color }}>{s.value}</div><div style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:600 }}>{s.label}</div></div>
                  </div>
                ))}
              </div>

              {/* CATEGORY BAR CHART */}
              <div style={{ ...S.card, marginBottom:'1.5rem' }}>
                <h3 style={{ fontWeight:700, marginBottom:'1.25rem' }}>Questions per Category</h3>
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-end', height:100 }}>
                  {catCounts.map(({ cat, count }) => (
                    <div key={cat} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem' }}>
                      <span style={{ fontSize:'0.75rem', fontWeight:700, color:CAT_COLOR[cat] }}>{count}</span>
                      <div style={{ width:'100%', borderRadius:'6px 6px 0 0', background:`${CAT_COLOR[cat]}88`, height:`${(count/maxCount)*80}px`, minHeight:4, transition:'height 0.5s' }} />
                      <span style={{ fontSize:'0.65rem', color:'#64748b', fontWeight:600, textAlign:'center' }}>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TABS */}
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem' }}>
                {['questions','quizzes'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{ padding:'0.5rem 1.25rem', borderRadius:10, border:'none', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', background: activeTab===t ? '#f5f3ff' : 'transparent', color: activeTab===t ? '#6366f1' : '#64748b', borderBottom: activeTab===t ? '2px solid #6366f1' : '2px solid transparent' }}>
                    {t === 'questions' ? `Questions (${questions.length})` : `Quizzes (${quizzes.length})`}
                  </button>
                ))}
              </div>

              {/* QUESTIONS TAB */}
              {activeTab === 'questions' && (
                <div style={S.card}>
                  {/* Toolbar */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem', marginBottom:'1.25rem', alignItems:'center' }}>
                    <div style={{ flex:1, minWidth:200, position:'relative' }}>
                      <Search style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'#64748b' }} />
                      <input style={{ ...S.input, paddingLeft:'2rem' }} placeholder="Search questions…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select style={{ ...S.input, width:'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select style={{ ...S.input, width:'auto' }} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
                      <option value="All">All Levels</option>
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button onClick={() => fileRef.current.click()} style={{ ...S.btnSec, display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      <Upload style={{ width:14, height:14 }} /> Import CSV
                    </button>
                    <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={handleCSV} />
                    <button onClick={() => setShowAddQ(true)} style={{ ...S.btn, display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      <PlusCircle style={{ width:15, height:15 }} /> Add Question
                    </button>
                  </div>

                  {/* Table */}
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr style={{ background:'#f1f5f9' }}>
                          {['#','Category','Difficulty','Question','Actions'].map(h => (
                            <th key={h} style={{ padding:'0.75rem 1rem', textAlign:'left', fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:1, color:'#64748b', fontWeight:700 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 && (
                          <tr><td colSpan={5} style={{ textAlign:'center', padding:'3rem', color:'#64748b' }}>No questions found.</td></tr>
                        )}
                        {filtered.map((q, i) => (
                          <tr key={q.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                            <td style={{ padding:'0.75rem 1rem', color:'#94a3b8', fontSize:'0.8rem' }}>{i+1}</td>
                            <td style={{ padding:'0.75rem 1rem' }}><span style={S.tag(CAT_COLOR[q.category] || '#64748b')}>{q.category}</span></td>
                            <td style={{ padding:'0.75rem 1rem' }}><span style={S.tag(DIFF_COLOR[q.difficultyLevel] || '#64748b')}>{q.difficultyLevel}</span></td>
                            <td style={{ padding:'0.75rem 1rem', fontSize:'0.875rem', maxWidth:400, color:'#334155' }}>{q.questionTitle}</td>
                            <td style={{ padding:'0.75rem 1rem' }}>
                              <div style={{ display:'flex', gap:'0.5rem' }}>
                                <button onClick={() => setEditQ(q)} style={{ background:'#f5f3ff', border:'none', color:'#6366f1', padding:'0.35rem 0.65rem', borderRadius:7, cursor:'pointer' }}><Edit2 style={{ width:13, height:13 }} /></button>
                                <button onClick={() => handleDeleteQ(q.id)} style={{ background:'#fef2f2', border:'none', color:'#ef4444', padding:'0.35rem 0.65rem', borderRadius:7, cursor:'pointer' }}><Trash2 style={{ width:13, height:13 }} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop:'0.75rem', color:'#475569', fontSize:'0.75rem' }}>Showing {filtered.length} of {questions.length} questions</div>
                </div>
              )}

              {/* QUIZZES TAB */}
              {activeTab === 'quizzes' && (
                <div style={S.card}>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1.25rem' }}>
                    <button onClick={() => setShowAddQuiz(true)} style={{ ...S.btn, display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      <PlusCircle style={{ width:15, height:15 }} /> Generate Quiz
                    </button>
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f1f5f9' }}>
                        {['ID','Title','Questions',''].map(h => <th key={h} style={{ padding:'0.75rem 1rem', textAlign:'left', fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:1, color:'#64748b', fontWeight:700 }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.length === 0 && <tr><td colSpan={4} style={{ textAlign:'center', padding:'3rem', color:'#64748b' }}>No quizzes yet.</td></tr>}
                      {quizzes.map(q => (
                        <tr key={q.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                          <td style={{ padding:'0.75rem 1rem', color:'#6366f1', fontWeight:700 }}>#{q.id}</td>
                          <td style={{ padding:'0.75rem 1rem', fontWeight:600, color:'#334155' }}>{q.title}</td>
                          <td style={{ padding:'0.75rem 1rem', color:'#64748b' }}>{q.questionsId?.length || 0} questions</td>
                          <td style={{ padding:'0.75rem 1rem' }}>
                            <button onClick={() => handleDeleteQuiz(q.id)} style={{ background:'#fef2f2', border:'none', color:'#ef4444', padding:'0.35rem 0.65rem', borderRadius:7, cursor:'pointer' }}><Trash2 style={{ width:13, height:13 }} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ADD QUESTION MODAL */}
      {showAddQ && <Modal title="Add New Question" onClose={() => setShowAddQ(false)}><QuestionForm onSave={handleAddQ} onCancel={() => setShowAddQ(false)} loading={loading} /></Modal>}

      {/* EDIT QUESTION MODAL */}
      {editQ && <Modal title="Edit Question" onClose={() => setEditQ(null)}><QuestionForm initial={editQ} onSave={handleUpdateQ} onCancel={() => setEditQ(null)} loading={loading} /></Modal>}

      {/* CREATE QUIZ MODAL */}
      {showAddQuiz && (
        <Modal title="Generate Quiz" onClose={() => setShowAddQuiz(false)}>
          <form onSubmit={handleCreateQuiz} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label style={S.label}>Quiz Title</label><input style={S.input} value={quizForm.title} onChange={e => setQuizForm(f=>({...f,title:e.target.value}))} required /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <div><label style={S.label}>Category</label>
                <select style={S.input} value={quizForm.category} onChange={e => setQuizForm(f=>({...f,category:e.target.value}))}>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={S.label}>No. of Questions</label><input type="number" min={1} max={20} style={S.input} value={quizForm.numQuestions} onChange={e => setQuizForm(f=>({...f,numQuestions:+e.target.value}))} /></div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
              <button type="button" style={{ ...S.btnSec, flex:1 }} onClick={() => setShowAddQuiz(false)}>Cancel</button>
              <button type="submit" style={{ ...S.btn, flex:1 }} disabled={loading}>{loading ? '...' : 'Create Quiz'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* TOAST NOTIFICATIONS */}
      {error && <div style={{ position:'fixed', bottom:'2rem', left:'50%', transform:'translateX(-50%)', background:'rgba(239,68,68,0.95)', color:'#fff', padding:'0.75rem 1.5rem', borderRadius:999, display:'flex', alignItems:'center', gap:'0.5rem', zIndex:2000 }}><AlertCircle style={{ width:16, height:16 }} />{error}<button onClick={()=>setError(null)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', fontWeight:700, marginLeft:8 }}>×</button></div>}
      {success && <div style={{ position:'fixed', bottom:'2rem', left:'50%', transform:'translateX(-50%)', background:'rgba(34,197,94,0.95)', color:'#fff', padding:'0.75rem 1.5rem', borderRadius:999, display:'flex', alignItems:'center', gap:'0.5rem', zIndex:2000 }}><CheckCircle style={{ width:16, height:16 }} />{success}</div>}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
