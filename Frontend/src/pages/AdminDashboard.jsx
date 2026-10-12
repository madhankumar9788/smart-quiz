import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import {
  BookOpen,
  LayoutDashboard,
  HelpCircle,
  FolderKanban,
  Users,
  BarChart2,
  Settings,
  LogOut,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Trophy,
  UserPlus,
  X,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  RefreshCw,
  FileText,
  Award,
  ShieldCheck,
  Upload,
  FileSpreadsheet,
  FileUp,
  Check,
  Calendar,
  ClipboardCheck,
  GraduationCap
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Results & Reports state
  const [allAttempts, setAllAttempts] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsQuizFilter, setResultsQuizFilter] = useState('All');
  const [resultsStatusFilter, setResultsStatusFilter] = useState('All');

  // Quiz Modal State (Create & Edit)
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    category: 'Programming',
    difficulty: 'Beginner',
    duration: 20,
    passing_percentage: 40,
    status: 'Active'
  });

  // Question Form State
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [questionForm, setQuestionForm] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 1,
    explanation: ''
  });

  // Edit Question Modal State
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionForm, setEditQuestionForm] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 1,
    explanation: ''
  });

  // User Form State (Enrolled Student)
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    section: 'A'
  });

  // Student Directory Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSectionFilter, setStudentSectionFilter] = useState('All');

  // Attendance Register State
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceSection, setAttendanceSection] = useState('All');
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { [studentId]: { status, remarks } }
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  // Categories list
  const [categories, setCategories] = useState([
    'Programming',
    'Web Development',
    'Database Systems',
    'Computer Science',
    'General Knowledge'
  ]);
  const [newCatName, setNewCatName] = useState('');

  // Bulk Upload States (Students & Questions)
  const [showBulkStudentModal, setShowBulkStudentModal] = useState(false);
  const [studentCsvRows, setStudentCsvRows] = useState([]);
  const [studentCsvFileName, setStudentCsvFileName] = useState('');
  const [bulkStudentLoading, setBulkStudentLoading] = useState(false);
  const [bulkStudentError, setBulkStudentError] = useState('');
  const [isStudentDragOver, setIsStudentDragOver] = useState(false);

  const [showBulkQuestionModal, setShowBulkQuestionModal] = useState(false);
  const [bulkTargetQuizId, setBulkTargetQuizId] = useState('');
  const [questionCsvRows, setQuestionCsvRows] = useState([]);
  const [questionCsvFileName, setQuestionCsvFileName] = useState('');
  const [bulkQuestionLoading, setBulkQuestionLoading] = useState(false);
  const [bulkQuestionError, setBulkQuestionError] = useState('');
  const [isQuestionDragOver, setIsQuestionDragOver] = useState(false);

  // CSV Helper Functions
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        result.push(char);
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/^["']|["']$/g, '').trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0 || values.every((v) => !v)) continue;
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] !== undefined ? values[idx].replace(/^["']|["']$/g, '').trim() : '';
      });
      rows.push(row);
    }
    return rows;
  };

  // Download Sample CSV Files
  const downloadSampleStudentCSV = () => {
    const csvContent =
      "name,email,password,section\n" +
      "Arun Kumar,arun.cse@smartquiz.com,student123,A\n" +
      "Priya Dharshini,priya.cse@smartquiz.com,student123,A\n" +
      "Karthik Raja,karthik.cse@smartquiz.com,student123,B\n" +
      "Divya Bharathi,divya.cse@smartquiz.com,student123,B\n" +
      "Suresh Raina,suresh.cse@smartquiz.com,student123,A\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_students_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleQuestionsCSV = () => {
    const csvContent =
      "question,option_a,option_b,option_c,option_d,correct_answer,marks,explanation\n" +
      "What does HTML stand for?,Hyper Text Markup Language,High Text Making Language,Hyperlinks Text Mark Language,Hyper Tool Multi Language,A,1,HTML stands for Hyper Text Markup Language.\n" +
      "What does CSS stand for?,Computer Style Sheets,Cascading Style Sheets,Colorful Style Sheets,Creative Style Sheets,B,1,CSS stands for Cascading Style Sheets.\n" +
      "Which CSS property controls text size?,font-style,text-size,font-size,text-style,C,1,The font-size property sets font size.\n" +
      "Inside which HTML element do we put JavaScript?,<script>,<js>,<javascript>,<scripting>,A,1,The <script> tag embeds client-side scripts.\n" +
      "How do you write 'Hello World' in an alert box?,msg('Hello World');,alert('Hello World');,msgBox('Hello World');,alertBox('Hello World');,B,1,The alert() function displays an alert dialog box.\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Student CSV File Upload Handler (with Drag & Drop)
  const processStudentFile = (file) => {
    if (!file) return;
    setStudentCsvFileName(file.name);
    setBulkStudentError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setBulkStudentError('CSV file is empty or does not contain data rows.');
          setStudentCsvRows([]);
          return;
        }
        const first = rows[0];
        if (!('name' in first) || !('email' in first)) {
          setBulkStudentError('CSV must include "name" and "email" columns in the header row.');
          setStudentCsvRows([]);
          return;
        }
        setStudentCsvRows(rows);
      } catch (err) {
        setBulkStudentError('Failed to parse CSV file: ' + err.message);
        setStudentCsvRows([]);
      }
    };
    reader.readAsText(file);
  };

  const handleStudentFileSelect = (e) => {
    processStudentFile(e.target.files[0]);
  };

  const handleStudentDrop = (e) => {
    e.preventDefault();
    setIsStudentDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processStudentFile(e.dataTransfer.files[0]);
    }
  };

  const handleBulkUploadStudentsSubmit = async () => {
    if (studentCsvRows.length === 0) return;
    setBulkStudentLoading(true);
    setBulkStudentError('');
    try {
      const res = await api.post('/auth/users/bulk', { users: studentCsvRows });
      if (res.data.success) {
        setMessage({
          text: `Bulk student import successful! ${res.data.createdCount} created, ${res.data.skippedCount} skipped.`,
          type: 'success'
        });
        setShowBulkStudentModal(false);
        setStudentCsvRows([]);
        setStudentCsvFileName('');
        fetchAllData();
      }
    } catch (err) {
      setBulkStudentError(err.response?.data?.message || 'Bulk student import failed.');
    } finally {
      setBulkStudentLoading(false);
    }
  };

  // Question CSV File Upload Handler (with Drag & Drop)
  const processQuestionFile = (file) => {
    if (!file) return;
    setQuestionCsvFileName(file.name);
    setBulkQuestionError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setBulkQuestionError('CSV file is empty or does not contain data rows.');
          setQuestionCsvRows([]);
          return;
        }
        const first = rows[0];
        const requiredCols = ['question', 'option_a', 'option_b', 'correct_answer'];
        const missing = requiredCols.filter((col) => !(col in first));
        if (missing.length > 0) {
          setBulkQuestionError(`CSV header is missing required columns: ${missing.join(', ')}`);
          setQuestionCsvRows([]);
          return;
        }
        setQuestionCsvRows(rows);
      } catch (err) {
        setBulkQuestionError('Failed to parse CSV file: ' + err.message);
        setQuestionCsvRows([]);
      }
    };
    reader.readAsText(file);
  };

  const handleQuestionFileSelect = (e) => {
    processQuestionFile(e.target.files[0]);
  };

  const handleQuestionDrop = (e) => {
    e.preventDefault();
    setIsQuestionDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processQuestionFile(e.dataTransfer.files[0]);
    }
  };

  const handleBulkUploadQuestionsSubmit = async () => {
    const targetQuiz = bulkTargetQuizId || selectedQuizId;
    if (!targetQuiz) {
      setBulkQuestionError('Please select a target quiz module.');
      return;
    }
    if (questionCsvRows.length === 0) return;
    setBulkQuestionLoading(true);
    setBulkQuestionError('');
    try {
      const res = await api.post(`/quizzes/${targetQuiz}/questions/bulk`, { questions: questionCsvRows });
      if (res.data.success) {
        setMessage({
          text: `Successfully imported ${res.data.createdCount} questions!`,
          type: 'success'
        });
        setShowBulkQuestionModal(false);
        setQuestionCsvRows([]);
        setQuestionCsvFileName('');
        fetchAllData();
        const qRes = await api.get(`/quizzes/${targetQuiz}/questions`);
        if (qRes.data.success) setQuestions(qRes.data.questions);
      }
    } catch (err) {
      setBulkQuestionError(err.response?.data?.message || 'Bulk question import failed.');
    } finally {
      setBulkQuestionLoading(false);
    }
  };

  // Fetch Attendance Records
  const fetchAttendance = useCallback(async (date, sec) => {
    setAttendanceLoading(true);
    try {
      const res = await api.get(`/attendance?date=${date}&section=${sec}`);
      if (res.data.success) {
        const map = {};
        res.data.records.forEach((r) => {
          map[r.student_id] = { status: r.status, remarks: r.remarks || '' };
        });
        setAttendanceRecords(map);
      }
    } catch (err) {
      console.error('Error fetching attendance records:', err);
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  // Fetch all initial data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [quizRes, userRes] = await Promise.all([
        api.get('/quizzes'),
        api.get('/auth/users')
      ]);

      if (quizRes.data.success) {
        const list = quizRes.data.quizzes || [];
        setQuizzes(list);
        if (list.length > 0 && !selectedQuizId) {
          setSelectedQuizId(list[0].id);
        }
      }

      if (userRes.data.success) {
        setUsersList(userRes.data.users || []);
      }
    } catch (err) {
      setMessage({ text: 'Error connecting to database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedQuizId]);

  // Fetch questions for selected quiz
  useEffect(() => {
    if (!selectedQuizId) return;
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/quizzes/${selectedQuizId}/questions`);
        if (res.data.success) setQuestions(res.data.questions || []);
      } catch (err) {
        console.error('Error loading questions:', err);
      }
    };
    fetchQuestions();
  }, [selectedQuizId]);

  // Fetch All Attempts for Results & Reports
  const fetchAllAttempts = useCallback(async (quizId = '', search = '') => {
    setResultsLoading(true);
    try {
      let url = '/results/admin/all';
      const params = new URLSearchParams();
      if (quizId && quizId !== 'All') params.append('quiz_id', quizId);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setAllAttempts(res.data.attempts || []);
      }
    } catch (err) {
      console.error('Failed to load examination reports:', err);
    } finally {
      setResultsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (activeMenu === 'results') {
      fetchAllAttempts();
    }
    if (activeMenu === 'attendance') {
      fetchAttendance(attendanceDate, attendanceSection);
    }
  }, [activeMenu, fetchAllAttempts, fetchAttendance, attendanceDate, attendanceSection]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Authenticating department session...</p>
        </div>
      </div>
    );
  }

  // Admin route protection only (Teacher role removed)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Quiz Modal Handlers
  const handleOpenCreateQuiz = () => {
    setEditingQuizId(null);
    setQuizForm({
      title: '',
      description: '',
      category: categories[0] || 'Programming',
      difficulty: 'Beginner',
      duration: 20,
      passing_percentage: 40,
      status: 'Active'
    });
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      if (editingQuizId) {
        const res = await api.put(`/quizzes/${editingQuizId}`, quizForm);
        if (res.data.success) {
          setMessage({ text: 'Quiz module updated successfully!', type: 'success' });
          setShowQuizModal(false);
          fetchAllData();
        }
      } else {
        const res = await api.post('/quizzes', quizForm);
        if (res.data.success) {
          setMessage({ text: 'New quiz module created successfully!', type: 'success' });
          setShowQuizModal(false);
          fetchAllData();
        }
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error saving quiz.', type: 'error' });
    }
  };

  const handleDeleteQuiz = async (qId, qTitle) => {
    if (!window.confirm(`Delete module "${qTitle}"? All questions in it will be permanently deleted.`)) return;
    try {
      const res = await api.delete(`/quizzes/${qId}`);
      if (res.data.success) {
        setMessage({ text: `Module "${qTitle}" deleted.`, type: 'success' });
        fetchAllData();
        if (selectedQuizId === qId) setSelectedQuizId('');
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete quiz.', type: 'error' });
    }
  };

  // Question CRUD
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuizId) {
      setMessage({ text: 'Please select a quiz module first.', type: 'error' });
      return;
    }
    setMessage({ text: '', type: '' });
    try {
      const res = await api.post(`/quizzes/${selectedQuizId}/questions`, questionForm);
      if (res.data.success) {
        setMessage({ text: 'Question added to module successfully!', type: 'success' });
        setQuestionForm({
          question: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'A',
          marks: 1,
          explanation: ''
        });
        fetchAllData();
        const qRes = await api.get(`/quizzes/${selectedQuizId}/questions`);
        if (qRes.data.success) setQuestions(qRes.data.questions);
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error saving question.', type: 'error' });
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${qId}`);
      setMessage({ text: 'Question removed.', type: 'success' });
      fetchAllData();
      const qRes = await api.get(`/quizzes/${selectedQuizId}/questions`);
      if (qRes.data.success) setQuestions(qRes.data.questions);
    } catch {
      setMessage({ text: 'Failed to delete question.', type: 'error' });
    }
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setEditQuestionForm({
      question: q.question || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_answer: q.correct_answer || 'A',
      marks: q.marks || 1,
      explanation: q.explanation || ''
    });
    setShowEditQuestionModal(true);
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put(`/questions/${editingQuestionId}`, editQuestionForm);
      if (res.data.success) {
        setMessage({ text: 'Question updated successfully!', type: 'success' });
        setShowEditQuestionModal(false);
        setEditingQuestionId(null);
        const qRes = await api.get(`/quizzes/${selectedQuizId}/questions`);
        if (qRes.data.success) setQuestions(qRes.data.questions);
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error updating question.', type: 'error' });
    }
  };

  // Student CRUD (Creates Student account with Class & Section)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/users', { ...userForm, role: 'student' });
      if (res.data.success) {
        setMessage({ text: `Student "${userForm.name}" created successfully!`, type: 'success' });
        setUserForm({
          name: '',
          email: '',
          password: '',
          role: 'student',
          section: 'A'
        });
        setShowUserModal(false);
        fetchAllData();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create student account.', type: 'error' });
    }
  };

  const handleDeleteUser = async (uId, uName) => {
    if (!window.confirm(`Delete student account "${uName}"?`)) return;
    try {
      await api.delete(`/auth/users/${uId}`);
      setMessage({ text: 'Student account removed.', type: 'success' });
      fetchAllData();
    } catch {
      setMessage({ text: 'Error removing student.', type: 'error' });
    }
  };

  // Category Management
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const trimmed = newCatName.trim();
    if (!categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setMessage({ text: `Category "${trimmed}" added successfully!`, type: 'success' });
      setNewCatName('');
    } else {
      setMessage({ text: `Category "${trimmed}" already exists.`, type: 'error' });
    }
  };

  const handleDeleteCategory = (catName) => {
    const assignedQuizzes = quizzes.filter((q) => q.category === catName);
    if (assignedQuizzes.length > 0) {
      if (!window.confirm(`Category "${catName}" has ${assignedQuizzes.length} quiz(zes) assigned. Delete it?`)) {
        return;
      }
    }
    setCategories(categories.filter((c) => c !== catName));
    setMessage({ text: `Category "${catName}" removed.`, type: 'success' });
  };

  // Attendance Management Helpers (Only Enrolled Students)
  const enrolledStudentsInClass = usersList.filter(
    (u) => (u.role === 'student' || !u.role) &&
           (attendanceSection === 'All' || (u.section || 'A') === attendanceSection)
  );

  const handleSetStudentStatus = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleSetStudentRemarks = (studentId, remarks) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'Present' }),
        remarks
      }
    }));
  };

  const handleMarkAllAttendance = (status) => {
    const updated = { ...attendanceRecords };
    enrolledStudentsInClass.forEach((s) => {
      updated[s.id] = {
        ...(updated[s.id] || {}),
        status
      };
    });
    setAttendanceRecords(updated);
  };

  const handleSaveAttendance = async () => {
    if (enrolledStudentsInClass.length === 0) {
      setMessage({ text: 'No students to mark attendance for.', type: 'error' });
      return;
    }
    setAttendanceSaving(true);
    try {
      const records = enrolledStudentsInClass.map((s) => ({
        student_id: s.id,
        section: s.section || (attendanceSection !== 'All' ? attendanceSection : 'A'),
        date: attendanceDate,
        status: attendanceRecords[s.id]?.status || 'Present',
        remarks: attendanceRecords[s.id]?.remarks || ''
      }));

      const res = await api.post('/attendance', { records });
      if (res.data.success) {
        setMessage({
          text: `Attendance register saved for ${records.length} students on ${attendanceDate}!`,
          type: 'success'
        });
        fetchAttendance(attendanceDate, attendanceSection);
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to save attendance.',
        type: 'error'
      });
    } finally {
      setAttendanceSaving(false);
    }
  };

  const exportAttendanceCSV = () => {
    let csv = "Roll_ID,Student_Name,Email,Section,Date,Status,Remarks\n";
    enrolledStudentsInClass.forEach((s) => {
      const st = attendanceRecords[s.id]?.status || 'Present';
      const rem = (attendanceRecords[s.id]?.remarks || '').replace(/"/g, '""');
      csv += `"${s.id}","${s.name}","${s.email}","${s.section || (attendanceSection !== 'All' ? attendanceSection : 'A')}","${attendanceDate}","${st}","${rem}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${attendanceSection}_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Counts & Filtered Lists (Admin role strictly hidden from student directory)
  const totalQuestionsCount = (quizzes || []).reduce((acc, q) => acc + (q?.total_questions || 0), 0);
  const studentsCount = (usersList || []).filter((u) => u?.role === 'student' || !u?.role).length;

  // Filtered Students Directory: NEVER shows admin accounts!
  const filteredUsersList = (usersList || []).filter((u) => {
    if (!u) return false;
    // Strictly exclude admin accounts
    if (u.role === 'admin' || u.role === 'teacher') return false;
    if (u.role && u.role !== 'student') return false;

    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const search = (studentSearch || '').toLowerCase();
    const matchSearch = name.includes(search) || email.includes(search) || String(u.id).includes(search);

    const matchSection = studentSectionFilter === 'All'
      ? true
      : (u.section || 'A') === studentSectionFilter;

    return matchSearch && matchSection;
  });

  // Calculate live attendance stats for current view
  const currentPresentCount = enrolledStudentsInClass.filter(
    (s) => (attendanceRecords[s.id]?.status || 'Present') === 'Present'
  ).length;
  const currentAbsentCount = enrolledStudentsInClass.filter(
    (s) => attendanceRecords[s.id]?.status === 'Absent'
  ).length;
  const currentLateCount = enrolledStudentsInClass.filter(
    (s) => attendanceRecords[s.id]?.status === 'Late'
  ).length;
  const currentAttendancePct = enrolledStudentsInClass.length
    ? Math.round((currentPresentCount / enrolledStudentsInClass.length) * 100)
    : 100;

  return (
    <div className="relative py-4 px-2 sm:px-4 max-w-7xl mx-auto">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col lg:flex-row min-h-[850px] transition-all">
        {/* ----------------- MODERN NEAT SIDEBAR ----------------- */}
        <aside className="w-full lg:w-64 flex-shrink-0 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-slate-200/70 p-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Brand Logo & Department */}
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 font-black text-base">
                🎓
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm tracking-tight block">smartquiz</span>
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">
                  CSE Department Admin
                </span>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-slate-700">Academic Reg 2026</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">CSE</span>
            </div>

            {/* Navigation Menu (Quizzes tab removed, Questions Bank, Categories, Attendance added) */}
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                { id: 'questions', label: 'Questions Bank', icon: HelpCircle, badge: totalQuestionsCount || 30 },
                { id: 'categories', label: 'Categories', icon: FolderKanban, badge: categories.length },
                { id: 'students', label: 'Students Directory', icon: Users, badge: studentsCount },
                { id: 'attendance', label: 'Attendance Register', icon: ClipboardCheck, highlight: true },
                { id: 'results', label: 'Exam Reports', icon: BarChart2 },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'settings', label: 'Portal Settings', icon: Settings }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMenu(item.id);
                      setMessage({ text: '', type: '' });
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/25'
                        : item.highlight
                        ? 'text-indigo-700 hover:bg-indigo-50 font-bold bg-indigo-50/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile Card & Role Display */}
          <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between px-1 mt-6 lg:mt-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-2xs flex-shrink-0">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-semibold text-indigo-600 truncate">
                  System Administrator
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout session"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* ----------------- MAIN VIEW AREA ----------------- */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Top Clean Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-900 capitalize tracking-tight flex items-center gap-2">
                <span>
                  {activeMenu === 'dashboard'
                    ? 'Dashboard Overview'
                    : activeMenu === 'questions'
                    ? 'Questions Bank'
                    : activeMenu === 'categories'
                    ? 'Category Management'
                    : activeMenu === 'students'
                    ? 'Enrolled Students Directory'
                    : activeMenu === 'attendance'
                    ? 'Class Attendance Register'
                    : activeMenu === 'results'
                    ? 'Examination Results & Reports'
                    : activeMenu}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  Admin Console
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {activeMenu === 'students' && (
                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Student</span>
                </button>
              )}

              {activeMenu === 'attendance' && (
                <button
                  onClick={handleSaveAttendance}
                  disabled={attendanceSaving}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  {attendanceSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Attendance</span>
                </button>
              )}

              <span className="text-[11px] font-medium text-slate-400 hidden sm:flex items-center gap-1.5 pl-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-semibold font-mono text-[10px]">MySQL Connected</span>
              </span>
            </div>
          </div>

          {/* Flash Notification Banner */}
          {message.text && (
            <div className="mx-6 mt-4">
              <div
                className={`p-3 rounded-2xl flex items-center justify-between text-xs border ${
                  message.type === 'success'
                    ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50/80 text-rose-800 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
                <button onClick={() => setMessage({ text: '', type: '' })} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Scrollable View Content */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">

            {/* ============================================================== */}
            {/* TAB 1: DASHBOARD OVERVIEW (CLEAN & MODERN)                     */}
            {/* ============================================================== */}
            {activeMenu === 'dashboard' && (
              <div className="space-y-6">
                {/* Clean Welcome Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="space-y-2 relative z-10 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                        Admin Control
                      </span>
                      <span className="text-xs text-slate-300">• Dept of Computer Science & Engineering</span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-white">
                      Welcome, Department Administrator
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Manage class-wise student attendance rosters, question banks across 3 core modules (HTML, CSS & JS), and review real-time examination submissions.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 relative z-10">
                    <button
                      onClick={() => setActiveMenu('attendance')}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Take Attendance</span>
                    </button>
                    <button
                      onClick={() => setActiveMenu('results')}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20 flex items-center gap-2"
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span>Exam Reports</span>
                    </button>
                  </div>
                </div>

                {/* 4 Clean Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Students */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students Enrolled</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{studentsCount}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-indigo-600">CSE Classes I, II, III & IV</p>
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px]">
                      <button onClick={() => setActiveMenu('students')} className="text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1">
                        <span>View Students</span> →
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Academic Batches */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Batches</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">4 Batches</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Target className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-600">Sections A, B & C Active</p>
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px]">
                      <button onClick={() => setActiveMenu('attendance')} className="text-slate-500 hover:text-emerald-600 font-bold flex items-center gap-1">
                        <span>Check Roster</span> →
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Questions Bank */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions Bank</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{totalQuestionsCount || 30} Qs</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-sky-600">3 Core Technical Modules</p>
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px]">
                      <button onClick={() => setActiveMenu('questions')} className="text-slate-500 hover:text-sky-600 font-bold flex items-center gap-1">
                        <span>Edit Questions</span> →
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Attendance Pulse */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Attendance</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">{currentAttendancePct}%</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500">{currentPresentCount} Present • {currentAbsentCount} Absent</p>
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px]">
                      <button onClick={() => setActiveMenu('attendance')} className="text-slate-500 hover:text-amber-600 font-bold flex items-center gap-1">
                        <span>Open Register</span> →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance Chart & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                          Department Examination Assessment Curve
                        </h3>
                        <p className="text-[11px] text-slate-400">Score distribution across core technical subjects</p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Single Attempt Locked
                      </span>
                    </div>

                    <div className="w-full h-44 relative">
                      <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="35" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="35" y1="55" x2="490" y2="55" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="35" y1="90" x2="490" y2="90" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="35" y1="125" x2="490" y2="125" stroke="#E2E8F0" strokeWidth="1" />

                        <text x="10" y="24" fill="#94A3B8" fontSize="10">100%</text>
                        <text x="14" y="59" fill="#94A3B8" fontSize="10">75%</text>
                        <text x="14" y="94" fill="#94A3B8" fontSize="10">50%</text>
                        <text x="20" y="129" fill="#94A3B8" fontSize="10">0%</text>

                        <polygon
                          points="35,100 130,50 260,35 370,80 480,45 480,125 35,125"
                          fill="url(#chartGradient)"
                        />
                        <polyline
                          points="35,100 130,50 260,35 370,80 480,45"
                          fill="none"
                          stroke="#4F46E5"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex justify-between pl-8 pr-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>HTML5 Architecture</span>
                        <span>CSS3 Layouts</span>
                        <span>JavaScript Logic</span>
                        <span>CSE Average</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Admin Action Hub
                      </h3>
                      <p className="text-[11px] text-slate-400">Quick shortcuts to manage CSE examinations</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveMenu('attendance')}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-left transition group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2 group-hover:scale-105 transition">
                          📋
                        </div>
                        <p className="text-xs font-bold text-slate-900">Attendance</p>
                        <p className="text-[10px] text-slate-400">Class register</p>
                      </button>

                      <button
                        onClick={() => setActiveMenu('questions')}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 text-left transition group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mb-2 group-hover:scale-105 transition">
                          ❓
                        </div>
                        <p className="text-xs font-bold text-slate-900">Questions</p>
                        <p className="text-[10px] text-slate-400">Add or edit bank</p>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu('students');
                          setShowUserModal(true);
                        }}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 text-left transition group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs mb-2 group-hover:scale-105 transition">
                          👤
                        </div>
                        <p className="text-xs font-bold text-slate-900">Add Student</p>
                        <p className="text-[10px] text-slate-400">Enrolled student</p>
                      </button>

                      <button
                        onClick={() => setActiveMenu('results')}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 text-left transition group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mb-2 group-hover:scale-105 transition">
                          📊
                        </div>
                        <p className="text-xs font-bold text-slate-900">Reports</p>
                        <p className="text-[10px] text-slate-400">CSV & Marks</p>
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Security: Strictly enforces 1 attempt per candidate with timer.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: QUESTIONS BANK                                          */}
            {/* ============================================================== */}
            {activeMenu === 'questions' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Questions Bank Repository</h2>
                    <p className="text-xs text-slate-400">Review questions, add new MCQs, or bulk upload CSV templates</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">Module:</label>
                    <select
                      value={selectedQuizId}
                      onChange={(e) => setSelectedQuizId(e.target.value)}
                      className="px-3.5 py-1.5 bg-slate-50 text-xs font-bold text-indigo-700 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      {quizzes.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.title} ({q.total_questions || 0} Questions)
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={downloadSampleQuestionsCSV}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sample CSV</span>
                    </button>

                    <button
                      onClick={() => {
                        setBulkTargetQuizId(selectedQuizId);
                        setQuestionCsvRows([]);
                        setQuestionCsvFileName('');
                        setBulkQuestionError('');
                        setShowBulkQuestionModal(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bulk Upload Qs (CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Add New Question Form Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-indigo-600" />
                    <span>Add New Question to Selected Module</span>
                  </h3>

                  <form onSubmit={handleAddQuestion} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Question Statement *
                      </label>
                      <textarea
                        rows="2"
                        required
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                        placeholder="e.g. Which HTML tag is used for defining an internal stylesheet?"
                        className="w-full px-3.5 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Option A *</label>
                        <input
                          type="text"
                          required
                          value={questionForm.option_a}
                          onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Option B *</label>
                        <input
                          type="text"
                          required
                          value={questionForm.option_b}
                          onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Option C *</label>
                        <input
                          type="text"
                          required
                          value={questionForm.option_c}
                          onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Option D *</label>
                        <input
                          type="text"
                          required
                          value={questionForm.option_d}
                          onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Correct Answer *</label>
                        <select
                          value={questionForm.correct_answer}
                          onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-indigo-700 border border-slate-200 rounded-xl"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Marks</label>
                        <input
                          type="number"
                          min="1"
                          value={questionForm.marks}
                          onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Explanation (Optional)</label>
                        <input
                          type="text"
                          value={questionForm.explanation}
                          onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                          placeholder="Short justification..."
                          className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      Save Question
                    </button>
                  </form>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Cataloged Questions ({questions.length})
                    </h3>
                  </div>

                  {questions.length === 0 ? (
                    <div className="p-10 bg-white rounded-3xl border border-slate-200/80 text-center text-slate-400">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-semibold">No questions found in this module yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4 hover:border-slate-300 transition"
                        >
                          <div className="space-y-1.5 flex-1">
                            <p className="text-xs font-bold text-slate-900">
                              <span className="text-indigo-600 font-mono mr-1.5">Q{idx + 1}.</span>
                              {q.question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-1">
                              <span><strong>A:</strong> {q.option_a}</span>
                              <span><strong>B:</strong> {q.option_b}</span>
                              <span><strong>C:</strong> {q.option_c}</span>
                              <span><strong>D:</strong> {q.option_d}</span>
                            </div>
                            <div className="flex items-center gap-3 pt-1 text-[11px]">
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                Correct: Option {q.correct_answer}
                              </span>
                              <span className="text-slate-400">
                                Marks: {q.marks || 1}
                              </span>
                              {q.explanation && (
                                <span className="text-slate-500 italic truncate max-w-sm">
                                  "{q.explanation}"
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleOpenEditQuestion(q)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                              title="Edit Question"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: CATEGORIES                                              */}
            {/* ============================================================== */}
            {activeMenu === 'categories' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Dynamic Category Management</h2>
                    <p className="text-xs text-slate-400">Organize and classify examination topics and syllabus modules</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    {categories.length} Categories Configured
                  </span>
                </div>

                {/* Add Category Bar */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
                  <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Artificial Intelligence, Cloud Computing..."
                      className="flex-1 px-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      + Add Category
                    </button>
                  </form>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat, i) => {
                    const matchedQuizzes = quizzes.filter((q) => q.category === cat);
                    const qCount = matchedQuizzes.reduce((acc, q) => acc + (q.total_questions || 0), 0);
                    return (
                      <div
                        key={i}
                        className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                              <span>📂</span>
                              <span>{cat}</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                              {matchedQuizzes.length} {matchedQuizzes.length === 1 ? 'Module' : 'Modules'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {qCount} Questions cataloged under this topic
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => {
                              if (matchedQuizzes.length > 0) {
                                setSelectedQuizId(matchedQuizzes[0].id);
                              }
                              setActiveMenu('questions');
                            }}
                            className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <span>View Questions</span> →
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Remove Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: ENROLLED STUDENTS DIRECTORY (ONLY STUDENTS SHOWN)       */}
            {/* ============================================================== */}
            {activeMenu === 'students' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">CSE Enrolled Students Directory</h2>
                    <p className="text-xs text-slate-400">Candidate roster (Only student candidates)</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={downloadSampleStudentCSV}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition"
                      title="Download Sample CSV Template"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Roster CSV Sample</span>
                    </button>
                    <button
                      onClick={() => {
                        setStudentCsvRows([]);
                        setStudentCsvFileName('');
                        setBulkStudentError('');
                        setShowBulkStudentModal(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bulk Upload (CSV)</span>
                    </button>
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Student</span>
                    </button>
                  </div>
                </div>

                {/* Filter Bar: Search & Section (Admin strictly excluded) */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search students by name, email, or roll ID..."
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Section Filter */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Section:</label>
                    <select
                      value={studentSectionFilter}
                      onChange={(e) => setStudentSectionFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 text-xs font-bold text-indigo-700 border border-slate-200 rounded-xl"
                    >
                      <option value="All">All Sections</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="px-5 py-3.5">Roll ID</th>
                        <th className="px-5 py-3.5">Candidate Name</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5">Section</th>
                        <th className="px-5 py-3.5">Enrolled Date</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsersList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No student candidate records found matching the active filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsersList.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/70 transition">
                            <td className="px-5 py-3 font-mono text-[11px] text-slate-400">#{s.id}</td>
                            <td className="px-5 py-3 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">
                                  {(s.name || 'S').charAt(0).toUpperCase()}
                                </div>
                                <span>{s.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-slate-500">{s.email}</td>
                            <td className="px-5 py-3">
                              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                Sec {s.section || 'A'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-400 text-[11px]">
                              {s?.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-5 py-3 text-right">
                              {user?.role === 'admin' && s?.id !== user.id && (
                                <button
                                  onClick={() => handleDeleteUser(s.id, s.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                  title="Delete Student Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: CLASS ATTENDANCE REGISTER                               */}
            {/* ============================================================== */}
            {activeMenu === 'attendance' && (
              <div className="space-y-5">
                {/* Header & Controls */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                        <span>Daily Student Attendance Register</span>
                      </h2>
                      <p className="text-xs text-slate-400">Mark student attendance date-wise and section-wise</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={exportAttendanceCSV}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export Register (CSV)</span>
                      </button>
                      <button
                        onClick={handleSaveAttendance}
                        disabled={attendanceSaving}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                      >
                        {attendanceSaving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Save to Database</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Selectors: Date & Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Attendance Date *
                      </label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => {
                          setAttendanceDate(e.target.value);
                          fetchAttendance(e.target.value, attendanceSection);
                        }}
                        className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Section Filter
                      </label>
                      <select
                        value={attendanceSection}
                        onChange={(e) => {
                          setAttendanceSection(e.target.value);
                          fetchAttendance(attendanceDate, e.target.value);
                        }}
                        className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-indigo-700 rounded-xl border border-slate-200"
                      >
                        <option value="All">All Sections</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* KPI Bar & Quick Action Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Total Enrolled</p>
                    <p className="text-xl font-black text-slate-900">{enrolledStudentsInClass.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Present ({currentAttendancePct}%)</p>
                    <p className="text-xl font-black text-emerald-600">{currentPresentCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Absent</p>
                    <p className="text-xl font-black text-rose-500">{currentAbsentCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Late</p>
                    <p className="text-xl font-black text-amber-500">{currentLateCount}</p>
                  </div>
                </div>

                {/* Quick Batch Actions */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs">
                  <div className="text-[11px] font-semibold text-slate-600">
                    Quick Register Actions:
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkAllAttendance('Present')}
                      className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark All Present</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAllAttendance('Absent')}
                      className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-bold transition flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Mark All Absent</span>
                    </button>
                  </div>
                </div>

                {/* Attendance Student Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  {attendanceLoading ? (
                    <div className="p-12 text-center space-y-2">
                      <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                      <p className="text-xs text-slate-400">Fetching attendance register for {attendanceSection === 'All' ? 'all sections' : `Sec ${attendanceSection}`}...</p>
                    </div>
                  ) : enrolledStudentsInClass.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 space-y-2">
                      <Users className="w-8 h-8 mx-auto opacity-30" />
                      <p className="text-xs font-bold text-slate-600">No students enrolled in {attendanceSection === 'All' ? 'any section' : `Section ${attendanceSection}`}.</p>
                      <p className="text-[11px]">Go to "Students Directory" tab to add students.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                        <tr>
                          <th className="px-5 py-3.5"># Roll</th>
                          <th className="px-5 py-3.5">Candidate Name</th>
                          <th className="px-5 py-3.5">Section</th>
                          <th className="px-5 py-3.5 text-center">Status (Click to Toggle)</th>
                          <th className="px-5 py-3.5">Remarks / Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {enrolledStudentsInClass.map((s, idx) => {
                          const currentStatus = attendanceRecords[s.id]?.status || 'Present';
                          const remarks = attendanceRecords[s.id]?.remarks || '';

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/70 transition">
                              <td className="px-5 py-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                              <td className="px-5 py-3">
                                <div>
                                  <p className="font-bold text-slate-900">{s.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{s.email}</p>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  Sec {s.section || 'A'}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => handleSetStudentStatus(s.id, 'Present')}
                                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                      currentStatus === 'Present'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-emerald-700'
                                    }`}
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Present</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleSetStudentStatus(s.id, 'Absent')}
                                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                      currentStatus === 'Absent'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-rose-700'
                                    }`}
                                  >
                                    <X className="w-3 h-3" />
                                    <span>Absent</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleSetStudentStatus(s.id, 'Late')}
                                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                      currentStatus === 'Late'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-amber-700'
                                    }`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>Late</span>
                                  </button>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <input
                                  type="text"
                                  value={remarks}
                                  onChange={(e) => handleSetStudentRemarks(s.id, e.target.value)}
                                  placeholder="e.g. OD, Sick, College bus delay..."
                                  className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 6: RESULTS & REPORTS                                       */}
            {/* ============================================================== */}
            {activeMenu === 'results' && (
              <ResultsSection
                allAttempts={allAttempts}
                resultsLoading={resultsLoading}
                resultsSearch={resultsSearch}
                setResultsSearch={setResultsSearch}
                resultsQuizFilter={resultsQuizFilter}
                setResultsQuizFilter={setResultsQuizFilter}
                resultsStatusFilter={resultsStatusFilter}
                setResultsStatusFilter={setResultsStatusFilter}
                quizzes={quizzes}
                fetchAllAttempts={fetchAllAttempts}
              />
            )}

            {/* ============================================================== */}
            {/* TAB 7: ANALYTICS                                               */}
            {/* ============================================================== */}
            {activeMenu === 'analytics' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Analytics Overview</h2>
                  <p className="text-xs text-slate-400">Department metrics and student performance statistics</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Score</p>
                    <p className="text-2xl font-black text-slate-900">78.5%</p>
                    <p className="text-[11px] font-semibold text-emerald-600">+8% vs last month</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</p>
                    <p className="text-2xl font-black text-slate-900">94.2%</p>
                    <p className="text-[11px] font-semibold text-emerald-600">High engagement</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Single Attempt Adherence</p>
                    <p className="text-2xl font-black text-emerald-600">100%</p>
                    <p className="text-[11px] font-medium text-slate-400">Locked exam policy</p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 8: SETTINGS                                                */}
            {/* ============================================================== */}
            {activeMenu === 'settings' && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Portal Configuration</h2>
                  <p className="text-xs text-slate-400">System policies and department examination rules</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Strict 1-Attempt Examination</p>
                      <p className="text-slate-400 text-[11px]">Enforce single submission per student</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Enabled</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Guest Quiz Access</p>
                      <p className="text-slate-400 text-[11px]">Require student login before quiz access</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Protected</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Database Driver</p>
                      <p className="text-slate-400 text-[11px]">MySQL Connection Pool</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">localhost:3306</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* MODAL: ADD NEW STUDENT (ROLE: STUDENT ONLY)                    */}
      {/* ============================================================== */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Add Enrolled Student</h3>
                <p className="text-xs text-slate-400">Provision a new student candidate account</p>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. Arun Kumar"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Student Email *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="e.g. arun.cse@smartquiz.com"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Section Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Section</label>
                <select
                  value={userForm.section}
                  onChange={(e) => setUserForm({ ...userForm, section: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-indigo-700 rounded-xl border border-slate-200"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: BULK UPLOAD STUDENTS (CSV)                              */}
      {/* ============================================================== */}
      {showBulkStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Bulk Upload Enrolled Students</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Drag & drop or upload CSV with student details & section</p>
              </div>
              <button
                onClick={() => {
                  setShowBulkStudentModal(false);
                  setStudentCsvRows([]);
                  setBulkStudentError('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bulkStudentError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bulkStudentError}</span>
              </div>
            )}

            {/* Template Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">Need the CSV roster format?</p>
                <p className="text-[11px] text-slate-500">Headers: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">name, email, password, section</code></p>
              </div>
              <button
                type="button"
                onClick={downloadSampleStudentCSV}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 transition text-xs shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            {/* Drag & Drop File Zone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select or Drop CSV File
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsStudentDragOver(true); }}
                onDragLeave={() => setIsStudentDragOver(false)}
                onDrop={handleStudentDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer relative ${
                  isStudentDragOver
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
                }`}
              >
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleStudentFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {studentCsvFileName ? studentCsvFileName : 'Click or drag a CSV file here'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Accepts standard .csv format</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            {studentCsvRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Preview ({studentCsvRows.length} Candidate Rows Detected)
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ Validated Format
                  </span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-[11px] text-slate-600 uppercase font-bold sticky top-0">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Sec</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {studentCsvRows.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-1.5 font-semibold">{row.name}</td>
                          <td className="px-3 py-1.5 text-slate-500 font-mono text-[11px]">{row.email}</td>
                          <td className="px-3 py-1.5 font-bold text-[10px]">{row.section || 'A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowBulkStudentModal(false);
                  setStudentCsvRows([]);
                  setBulkStudentError('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={studentCsvRows.length === 0 || bulkStudentLoading}
                onClick={handleBulkUploadStudentsSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
              >
                {bulkStudentLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing Candidates...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Upload {studentCsvRows.length} Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: BULK UPLOAD QUESTIONS (CSV)                             */}
      {/* ============================================================== */}
      {showBulkQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  <span>Bulk Upload Quiz Questions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload a question bank CSV into the selected module</p>
              </div>
              <button
                onClick={() => {
                  setShowBulkQuestionModal(false);
                  setQuestionCsvRows([]);
                  setBulkQuestionError('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bulkQuestionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bulkQuestionError}</span>
              </div>
            )}

            {/* Target Quiz Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Assessment Module *
              </label>
              <select
                value={bulkTargetQuizId || selectedQuizId}
                onChange={(e) => setBulkTargetQuizId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-indigo-700 border border-slate-200 rounded-xl"
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.category} • Current: {q.total_questions || 0} Questions)
                  </option>
                ))}
              </select>
            </div>

            {/* Download Template Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">Need the questions CSV format?</p>
                <p className="text-[11px] text-slate-500">Headers: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">question, option_a, option_b, option_c, option_d, correct_answer, marks, explanation</code></p>
              </div>
              <button
                type="button"
                onClick={downloadSampleQuestionsCSV}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 transition text-xs shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            {/* CSV File Drag & Drop */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Questions CSV File
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsQuestionDragOver(true); }}
                onDragLeave={() => setIsQuestionDragOver(false)}
                onDrop={handleQuestionDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer relative ${
                  isQuestionDragOver
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                }`}
              >
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleQuestionFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {questionCsvFileName ? questionCsvFileName : 'Click or drag questions CSV here'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Accepts standard questions format</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            {questionCsvRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Preview Questions ({questionCsvRows.length} Questions Detected)
                  </span>
                  <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                    Ready to Import
                  </span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-[11px] text-slate-600 uppercase font-bold sticky top-0">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Question</th>
                        <th className="px-3 py-2">Options (A, B, C, D)</th>
                        <th className="px-3 py-2 text-center">Answer</th>
                        <th className="px-3 py-2">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {questionCsvRows.slice(0, 10).map((row, idx) => {
                        const ans = (row.correct_answer || '').toUpperCase();
                        const isValid = ['A', 'B', 'C', 'D'].includes(ans);
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2 font-bold max-w-xs truncate" title={row.question}>{row.question}</td>
                            <td className="px-3 py-2 text-[11px] text-slate-500 max-w-xs truncate">
                              A: {row.option_a} | B: {row.option_b}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {ans || '?'}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-600">{row.marks || 1}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowBulkQuestionModal(false);
                  setQuestionCsvRows([]);
                  setBulkQuestionError('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={questionCsvRows.length === 0 || bulkQuestionLoading}
                onClick={handleBulkUploadQuestionsSubmit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
              >
                {bulkQuestionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Import {questionCsvRows.length} Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT QUESTION                                           */}
      {/* ============================================================== */}
      {showEditQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Edit Question</span>
              </h3>
              <button onClick={() => setShowEditQuestionModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateQuestion} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Question Statement *</label>
                <textarea
                  rows="3"
                  required
                  value={editQuestionForm.question}
                  onChange={(e) => setEditQuestionForm({ ...editQuestionForm, question: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Option A *</label>
                  <input
                    type="text"
                    required
                    value={editQuestionForm.option_a}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, option_a: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Option B *</label>
                  <input
                    type="text"
                    required
                    value={editQuestionForm.option_b}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, option_b: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Option C *</label>
                  <input
                    type="text"
                    required
                    value={editQuestionForm.option_c}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, option_c: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Option D *</label>
                  <input
                    type="text"
                    required
                    value={editQuestionForm.option_d}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, option_d: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Correct Answer *</label>
                  <select
                    value={editQuestionForm.correct_answer}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, correct_answer: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 text-xs font-bold text-indigo-700 border border-slate-200 rounded-xl"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={editQuestionForm.marks}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, marks: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Explanation (Optional)</label>
                <input
                  type="text"
                  value={editQuestionForm.explanation}
                  onChange={(e) => setEditQuestionForm({ ...editQuestionForm, explanation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditQuestionModal(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

/* =============================================================
   RESULTS SECTION — Dynamic, Downloadable, Filterable Report
   ============================================================= */
function ResultsSection({
  allAttempts = [], resultsLoading,
  resultsSearch = '', setResultsSearch,
  resultsQuizFilter = 'All', setResultsQuizFilter,
  resultsStatusFilter = 'All', setResultsStatusFilter,
  quizzes = [], fetchAllAttempts
}) {
  const safeAttempts = Array.isArray(allAttempts) ? allAttempts : [];
  const filtered = safeAttempts.filter((a) => {
    if (!a) return false;
    const name = (a.student_name || '').toLowerCase();
    const email = (a.student_email || '').toLowerCase();
    const search = (resultsSearch || '').toLowerCase();
    const matchSearch = !resultsSearch || name.includes(search) || email.includes(search);
    const matchQuiz = resultsQuizFilter === 'All' || String(a.quiz_id) === String(resultsQuizFilter);
    const matchStatus = resultsStatusFilter === 'All' || a.status === resultsStatusFilter;
    return matchSearch && matchQuiz && matchStatus;
  });

  const totalPassed = filtered.filter((a) => a.status === 'Passed').length;
  const totalFailed = filtered.filter((a) => a.status === 'Failed').length;
  const avgPct = filtered.length
    ? (filtered.reduce((s, a) => s + Number(a.percentage || 0), 0) / filtered.length).toFixed(1)
    : '0.0';

  const downloadCSV = () => {
    const headers = ['#', 'Attempt ID', 'Student Name', 'Email', 'Assessment', 'Category', 'Score', 'Total Questions', 'Percentage', 'Status', 'Submitted At'];
    const rows = filtered.map((a, i) => [
      i + 1,
      a.id,
      `"${a.student_name || ''}"`,
      `"${a.student_email || ''}"`,
      `"${a.quiz_title || ''}"`,
      `"${a.quiz_category || ''}"`,
      a.score,
      a.total_questions,
      `${a.percentage}%`,
      a.status,
      a.submitted_at ? new Date(a.submitted_at).toLocaleString() : ''
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartQuiz_Results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SmartQuiz - Examination Results Report</title>
        <style>
          * { font-family: Arial, sans-serif; }
          body { padding: 24px; color: #1e293b; }
          .header { margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
          h1 { font-size: 20px; color: #1e293b; margin: 0 0 4px; }
          .sub { font-size: 12px; color: #64748b; margin: 0; }
          .meta { display: flex; gap: 24px; margin: 16px 0; }
          .meta-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 16px; }
          .meta-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
          .meta-val { font-size: 20px; font-weight: 900; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          thead th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
          tbody td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
          .passed { background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
          .failed { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
          .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 SmartQuiz — Examination Results Report</h1>
          <p class="sub">Generated on ${new Date().toLocaleString()} | Total Records: ${filtered.length}</p>
        </div>
        <div class="meta">
          <div class="meta-card"><div class="meta-label">Total Attempts</div><div class="meta-val">${filtered.length}</div></div>
          <div class="meta-card"><div class="meta-label">Passed</div><div class="meta-val" style="color:#059669">${totalPassed}</div></div>
          <div class="meta-card"><div class="meta-label">Failed</div><div class="meta-val" style="color:#dc2626">${totalFailed}</div></div>
          <div class="meta-card"><div class="meta-label">Average Score</div><div class="meta-val" style="color:#4f46e5">${avgPct}%</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Assessment</th>
              <th>Score</th>
              <th>%</th>
              <th>Status</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((a, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${a.student_name}</strong></td>
                <td>${a.student_email}</td>
                <td>${a.quiz_title}</td>
                <td>${a.score}/${a.total_questions}</td>
                <td>${a.percentage}%</td>
                <td><span class="${a.status === 'Passed' ? 'passed' : 'failed'}">${a.status}</span></td>
                <td>${a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">SmartQuiz Examination System • Official Report Document</div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Results & Analytics Reports</h2>
          <p className="text-xs text-slate-400">Dynamic examination marks register with print and CSV export</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Attempts</p>
          <p className="text-xl font-black text-slate-900">{filtered.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <p className="text-[11px] font-bold uppercase text-slate-400">Passed</p>
          <p className="text-xl font-black text-emerald-600">{totalPassed}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <p className="text-[11px] font-bold uppercase text-slate-400">Failed</p>
          <p className="text-xl font-black text-rose-500">{totalFailed}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <p className="text-[11px] font-bold uppercase text-slate-400">Avg Score</p>
          <p className="text-xl font-black text-indigo-600">{avgPct}%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={resultsSearch}
            onChange={(e) => setResultsSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAllAttempts(
              resultsQuizFilter !== 'All' ? resultsQuizFilter : '', resultsSearch
            )}
            placeholder="Search student name / email..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={resultsQuizFilter}
          onChange={(e) => {
            setResultsQuizFilter(e.target.value);
            fetchAllAttempts(e.target.value !== 'All' ? e.target.value : '', resultsSearch);
          }}
          className="px-3 py-2 bg-slate-50 text-xs font-bold border border-slate-200 rounded-xl text-slate-700"
        >
          <option value="All">All Quizzes</option>
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>

        <select
          value={resultsStatusFilter}
          onChange={(e) => setResultsStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 text-xs font-bold border border-slate-200 rounded-xl text-slate-700"
        >
          <option value="All">All Status</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
        </select>

        <button
          onClick={() => fetchAllAttempts(resultsQuizFilter !== 'All' ? resultsQuizFilter : '', resultsSearch)}
          className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition"
        >
          Apply Filter
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
        {resultsLoading ? (
          <div className="p-12 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading examination records from database...</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Assessment</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5">Percentage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No examination records found. Students need to submit quizzes first.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {(a.student_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 text-xs">{a.student_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">{a.student_email}</td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{a.quiz_title}</p>
                        <p className="text-[10px] text-slate-400">{a.quiz_category}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 text-xs">{a.score}/{a.total_questions}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[48px]">
                          <div
                            className={`h-full rounded-full ${
                              Number(a.percentage) >= 60 ? 'bg-emerald-500' : Number(a.percentage) >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(Number(a.percentage), 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-indigo-600 text-xs whitespace-nowrap">{a.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        a.status === 'Passed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {a.status === 'Passed' ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-400">
                      {a.submitted_at ? new Date(a.submitted_at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {filtered.length > 0 && !resultsLoading && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-[11px] text-slate-400">
              Showing <strong>{filtered.length}</strong> of <strong>{allAttempts.length}</strong> examination records
            </p>
            <div className="flex gap-2">
              <button
                onClick={printReport}
                className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <Printer className="w-3 h-3" /> Print
              </button>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5" /> CSV Export
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
