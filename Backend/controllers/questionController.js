const QuestionModel = require('../models/questionModel');
const QuizModel = require('../models/quizModel');

// Get all questions for a specific quiz
const getQuestionsForQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    const canSeeAnswers = req.user && (req.user.role === 'admin' || req.user.id === quiz.created_by);
    const questions = await QuestionModel.findByQuizId(quizId, canSeeAnswers);

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    next(error);
  }
};

// Add a question to a quiz with marks and explanation
const addQuestionToQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { question, option_a, option_b, option_c, option_d, correct_answer, marks, explanation } = req.body;

    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    if (req.user.role !== 'admin' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the author or admin can add questions.'
      });
    }

    if (!question || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return res.status(400).json({
        success: false,
        message: 'All 4 options (A, B, C, D), question text, and correct_answer (A, B, C, D) are required.'
      });
    }

    const normalizedAnswer = correct_answer.toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(normalizedAnswer)) {
      return res.status(400).json({
        success: false,
        message: 'correct_answer must be one of: A, B, C, D.'
      });
    }

    const newQuestion = await QuestionModel.create({
      quiz_id: quizId,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer: normalizedAnswer,
      marks: marks ? Number(marks) : 1,
      explanation: explanation || ''
    });

    res.status(201).json({
      success: true,
      message: 'Question added successfully.',
      question: newQuestion
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing question
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, option_a, option_b, option_c, option_d, correct_answer, marks, explanation } = req.body;

    const existingQuestion = await QuestionModel.findById(id);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    if (correct_answer) {
      const normalizedAnswer = correct_answer.toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(normalizedAnswer)) {
        return res.status(400).json({
          success: false,
          message: 'correct_answer must be one of: A, B, C, D.'
        });
      }
    }

    await QuestionModel.update(id, {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      marks,
      explanation
    });

    const updated = await QuestionModel.findById(id);

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      question: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete a question
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingQuestion = await QuestionModel.findById(id);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    await QuestionModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Bulk Add questions to a quiz from CSV
const bulkAddQuestionsToQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    if (req.user.role !== 'admin' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only admin can bulk import questions.'
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid array of questions is required.'
      });
    }

    let addedCount = 0;
    let skippedCount = 0;
    const errors = [];
    const addedQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionText = (q.question || '').trim();
      const optionA = (q.option_a || '').trim();
      const optionB = (q.option_b || '').trim();
      const optionC = (q.option_c || '').trim();
      const optionD = (q.option_d || '').trim();
      const rawAns = (q.correct_answer || '').trim().toUpperCase();
      const marks = q.marks ? Number(q.marks) : 1;
      const explanation = (q.explanation || '').trim();

      if (!questionText || !optionA || !optionB || !optionC || !optionD || !rawAns) {
        skippedCount++;
        errors.push(`Row ${i + 1}: Question text and all 4 options (A,B,C,D) are required.`);
        continue;
      }

      if (!['A', 'B', 'C', 'D'].includes(rawAns)) {
        skippedCount++;
        errors.push(`Row ${i + 1}: correct_answer must be A, B, C, or D (got: '${rawAns}').`);
        continue;
      }

      const created = await QuestionModel.create({
        quiz_id: quizId,
        question: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: rawAns,
        marks,
        explanation
      });

      addedQuestions.push(created);
      addedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Bulk import completed: ${addedCount} questions added, ${skippedCount} skipped.`,
      addedCount,
      skippedCount,
      errors,
      questions: addedQuestions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestionsForQuiz,
  addQuestionToQuiz,
  bulkAddQuestionsToQuiz,
  updateQuestion,
  deleteQuestion
};
