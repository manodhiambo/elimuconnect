import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  SkipForward,
  Flag,
  RotateCcw,
  Play,
  Pause,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const QuizEngine = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await api.get(`/quiz/${quizId}`);
        const quizData = response.data;
        
        setQuiz(quizData);
        setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
        
        // Initialize answers object
        const initialAnswers = {};
        quizData.questions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load quiz:', error);
        setLoading(false);
      }
    };

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  // Timer logic
  useEffect(() => {
    let interval;
    
    if (quizStarted && !isPaused && !quizCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizStarted, isPaused, quizCompleted, timeRemaining]);

  // Auto-save answers
  useEffect(() => {
    if (quizStarted && Object.keys(answers).length > 0) {
      const saveAnswers = async () => {
        try {
          await api.post(`/quiz/${quizId}/save-progress`, {
            answers,
            currentQuestionIndex,
            timeRemaining,
            flaggedQuestions: Array.from(flaggedQuestions)
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      };

      const timeout = setTimeout(saveAnswers, 2000);
      return () => clearTimeout(timeout);
    }
  }, [answers, currentQuestionIndex, quizId, quizStarted, timeRemaining, flaggedQuestions]);

  const startQuiz = () => {
    setQuizStarted(true);
    setIsPaused(false);
  };

  const pauseQuiz = () => {
    setIsPaused(!isPaused);
  };

  const handleTimeUp = useCallback(() => {
    setQuizCompleted(true);
    submitQuiz();
  }, []);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const toggleFlag = (questionIndex) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const response = await api.post(`/quiz/${quizId}/submit`, {
        answers,
        timeSpent: (quiz.timeLimit * 60) - timeRemaining,
        flaggedQuestions: Array.from(flaggedQuestions)
      });

      navigate(`/quiz/${quizId}/results`, { 
        state: { results: response.data } 
      });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer !== null).length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredCount() / quiz.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Found</h2>
        <p className="text-gray-600">The quiz you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/papers')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Papers
        </button>
      </div>
    );
  }

  // Pre-quiz screen
  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Questions</h3>
              <p className="text-blue-600 font-bold text-xl">{quiz.questions.length}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Time Limit</h3>
              <p className="text-green-600 font-bold text-xl">{quiz.timeLimit} min</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Total Points</h3>
              <p className="text-purple-600 font-bold text-xl">{quiz.totalPoints}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
            <ul className="text-yellow-700 space-y-1">
              <li>• Read each question carefully before answering</li>
              <li>• You can flag questions for review</li>
              <li>• Your progress is automatically saved</li>
              <li>• You can navigate between questions freely</li>
              <li>• Submit before time runs out</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={startQuiz}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestionIndex] !== null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center text-blue-600">
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-mono font-semibold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={pauseQuiz}
              className={`p-2 rounded-md ${
                isPaused ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              } hover:bg-opacity-80`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Submit Quiz
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress: {getAnsweredCount()}/{quiz.questions.length}</span>
            <span>{Math.round(getProgressPercentage())}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-8 h-8 rounded-md text-sm font-medium flex items-center justify-center relative ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[index] !== null
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                  {flaggedQuestions.has(index) && (
                    <Flag className="w-2 h-2 text-red-500 absolute -top-1 -right-1" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-sm mr-2" />
                <span>Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm mr-2" />
                <span>Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm mr-2" />
                <span>Not Answered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-md mr-3">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>
                <button
                  onClick={() => toggleFlag(currentQuestionIndex)}
                  className={`p-2 rounded-md ${
                    flaggedQuestions.has(currentQuestionIndex)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Question Image */}
              {currentQuestion.image && (
                <img
                  src={currentQuestion.image}
                  alt="Question"
                  className="w-full max-w-md mx-auto mb-6 rounded-lg"
                />
              )}

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.label
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={index}
                        checked={answers[currentQuestionIndex] === index}
                        onChange={() => handleAnswerSelect(currentQuestionIndex, index)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        answers[currentQuestionIndex] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestionIndex] === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </motion.label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex space-x-2">
                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      Next
                      <SkipForward className="w-4 h-4 ml-1" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Review & Submit
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Quiz?</h3>
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <p>Questions answered: {getAnsweredCount()}/{quiz.questions.length}</p>
                <p>Time remaining: {formatTime(timeRemaining)}</p>
                {quiz.questions.length - getAnsweredCount() > 0 && (
                  <p className="text-amber-600">
                    You have {quiz.questions.length - getAnsweredCount()} unanswered questions.
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-8 text-center"
            >
              <Pause className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Paused</h2>
              <p className="text-gray-600 mb-4">Click resume to continue</p>
              <button
                onClick={pauseQuiz}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizEngine;
