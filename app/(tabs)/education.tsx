import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = 320;
const API_BASE_URL = 'https://green-step-backend.vercel.app';

interface NavigationItem {
  id: string;
  title: string;
}

interface NavigationSection {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: NavigationItem[];
}

interface ContentData {
  id: string;
  title: string;
  content: string;
}

interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
  timestamp: number;
}

interface QuizQuestion {
  questionId: string;
  question: string;
  options: string[];
}

interface Quiz {
  quizId: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
  questionCount?: number;
  questions?: QuizQuestion[];
}

interface QuizResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  passed: boolean;
  detailedAnswers: Array<{
    questionId: string;
    question: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
  }>;
}

const EducationTab: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [chatbotOpen, setChatbotOpen] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [typing, setTyping] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [contentData, setContentData] = useState<Record<string, ContentData>>({});
  const [availableContent, setAvailableContent] = useState<Record<string, ContentData[]>>({});
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showQuizList, setShowQuizList] = useState<boolean>(false);
  const chatScrollRef = useRef<ScrollView>(null);

  // Quiz states
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);

  // Animation references
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const chatScaleAnim = useRef(new Animated.Value(0)).current;
  const chatButtonTranslateY = useRef(new Animated.Value(0)).current;

  // Initialize session ID and fetch data
  useEffect(() => {
    const generateSessionId = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    fetchEducationalContent();
    fetchQuizzes();
  }, []);

  // Fetch educational content
  const fetchEducationalContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/education/content`);
      
      if (response.data.success) {
        const organizedContent = response.data.data;
        const flatContent: Record<string, ContentData> = {};
        
        Object.keys(organizedContent).forEach(sectionId => {
          organizedContent[sectionId].forEach((item: ContentData) => {
            flatContent[item.id] = item;
          });
        });
        
        setContentData(flatContent);
        setAvailableContent(organizedContent);
        
        const firstSection = Object.keys(organizedContent)[0];
        if (firstSection && organizedContent[firstSection].length > 0) {
          setSelectedContent(organizedContent[firstSection][0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching educational content:', error);
      Alert.alert('Error', 'Failed to load educational content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch quizzes
  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/education/quizzes`);
      
      if (response.data.success) {
        setQuizzes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  // Start a quiz
  const startQuiz = async (quizId: string) => {
    try {
      setLoadingQuiz(true);
      const response = await axios.get(`${API_BASE_URL}/api/education/quizzes/${quizId}`);
      
      if (response.data.success) {
        setSelectedQuiz(response.data.data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setQuizResult(null);
        setShowQuizList(false);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      Alert.alert('Error', 'Failed to load quiz. Please try again.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Select an answer
  const selectAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Navigate questions
  const nextQuestion = () => {
    if (selectedQuiz && currentQuestionIndex < selectedQuiz.questions!.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!selectedQuiz) return;

    const unansweredCount = selectedQuiz.questions!.filter(
      q => selectedAnswers[q.questionId] === undefined
    ).length;

    if (unansweredCount > 0) {
      Alert.alert(
        'Incomplete Quiz',
        `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => performQuizSubmission() }
        ]
      );
      return;
    }

    performQuizSubmission();
  };

  const performQuizSubmission = async () => {
    if (!selectedQuiz) return;

    const answers = selectedQuiz.questions!.map(q => ({
      questionId: q.questionId,
      selectedAnswer: selectedAnswers[q.questionId] ?? -1
    }));

    setSubmittingQuiz(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/education/quizzes/${selectedQuiz.quizId}/submit`,
        { answers },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setQuizResult(response.data.data);
        setQuizSubmitted(true);
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Required', 'Please log in to submit quizzes.');
      } else {
        Alert.alert('Error', 'Failed to submit quiz. Please try again.');
      }
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setShowQuizList(true);
  };

  // Exit quiz
  const exitQuiz = () => {
    Alert.alert(
      'Exit Quiz',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            setSelectedQuiz(null);
            setCurrentQuestionIndex(0);
            setSelectedAnswers({});
            setQuizSubmitted(false);
            setQuizResult(null);
            setShowQuizList(true);
          }
        }
      ]
    );
  };

  const navigationSections: NavigationSection[] = [
    {
      id: 'basics',
      title: 'Basics of Reforestation',
      icon: 'leaf-outline',
      items: availableContent['basics'] || []
    },
    {
      id: 'species-planting',
      title: 'Tree Species & Planting',
      icon: 'book-outline',
      items: availableContent['species-planting'] || []
    },
    {
      id: 'reforestation-techniques',
      title: 'Reforestation Techniques',
      icon: 'people-outline',
      items: availableContent['reforestation-techniques'] || []
    },
    {
      id: 'environmental-awareness',
      title: 'Environmental Awareness',
      icon: 'bulb-outline',
      items: availableContent['environmental-awareness'] || []
    },
    {
      id: 'educational-media',
      title: 'Educational Media',
      icon: 'document-text-outline',
      items: availableContent['educational-media'] || []
    },
    {
      id: 'activities-engagement',
      title: 'Activities & Engagement',
      icon: 'trophy-outline',
      items: availableContent['activities-engagement'] || []
    },
    {
      id: 'resources',
      title: 'Resources',
      icon: 'bookmark-outline',
      items: availableContent['resources'] || []
    }
  ];

  // Animations
  useEffect(() => {
    if (sidebarOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0.4,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (chatbotOpen) {
      Animated.parallel([
        Animated.timing(chatScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(chatButtonTranslateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(chatScaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(chatButtonTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [chatbotOpen]);

  useEffect(() => {
    if (chatScrollRef.current && chatMessages.length > 0) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const toggleSection = (sectionId: string): void => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleContentSelect = (contentId: string): void => {
    setSelectedContent(contentId);
    setSidebarOpen(false);
    setShowQuizList(false);
    setSelectedQuiz(null);
  };

  const handleShowQuizzes = (): void => {
    setShowQuizList(true);
    setSelectedContent('');
    setSidebarOpen(false);
    setSelectedQuiz(null);
  };

  const sendMessage = async (): Promise<void> => {
    if (!chatInput.trim() || !sessionId) return;
    
    const userMessage: ChatMessage = {
      type: 'user',
      message: chatInput.trim(),
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = chatInput.trim();
    setChatInput('');
    setTyping(true);

    try {
      const response = await axios.post(
        "https://nivakaran-greenstep.hf.space/ask",
        {
          session_id: sessionId,
          question: currentMessage
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 20000
        }
      );

      const answer = response.data?.answer || "I apologize, but I couldn't process your request. Please try again.";
      
      const botMessage: ChatMessage = {
        type: 'bot',
        message: answer,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, botMessage]);
      setTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: ChatMessage = {
        type: 'bot',
        message: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      setTyping(false);
    }
  };

  const parseMessageToJSX = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <Text key={index} style={{ fontWeight: 'bold' }}>
            {boldText}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const TypingIndicator = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 16 }}>
      <View style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }}>
        <View style={{ flexDirection: 'row' }}>
          {[0, 1, 2].map((dot) => (
            <View
              key={dot}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#6b7280',
                marginHorizontal: 3,
                opacity: 0.6
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderQuizList = () => (
    <View style={{ flex: 1 }}>
      <Text style={{
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        paddingHorizontal: 4
      }}>
        Available Quizzes
      </Text>
      <Text style={{
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 24,
        paddingHorizontal: 4
      }}>
        Test your knowledge and earn points!
      </Text>

      {loadingQuiz ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : quizzes.length === 0 ? (
        <View style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          marginHorizontal: 4
        }}>
          <Text style={{ color: '#6b7280', fontSize: 16 }}>No quizzes available yet.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {quizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz.quizId}
              onPress={() => startQuiz(quiz.quizId)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: 20,
                marginBottom: 16,
                marginHorizontal: 4,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937', flex: 1, marginRight: 12 }}>
                  {quiz.title}
                </Text>
                <View style={{
                  backgroundColor: '#dcfce7',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12
                }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#16a34a' }}>
                    {quiz.points} pts
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <View style={{
                  backgroundColor: '#f3f4f6',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6
                }}>
                  <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>
                    {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#f3f4f6',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6
                }}>
                  <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>
                    {quiz.questionCount || quiz.questions?.length || 0} Questions
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#16a34a', fontWeight: '600' }}>
                  Start Quiz →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderQuizQuestion = () => {
    if (!selectedQuiz || !selectedQuiz.questions) return null;

    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const isAnswered = selectedAnswers[currentQuestion.questionId] !== undefined;
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    return (
      <View style={{ flex: 1 }}>
        {/* Progress Bar */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: '#6b7280', fontWeight: '500' }}>
              Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
            </Text>
            <Text style={{ fontSize: 14, color: '#16a34a', fontWeight: '600' }}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={{
            height: 8,
            backgroundColor: '#e5e7eb',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <View style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#16a34a',
              borderRadius: 4
            }} />
          </View>
        </View>

        {/* Question */}
        <View style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#e5e7eb'
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#1f2937',
            lineHeight: 28
          }}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* Options */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion.questionId] === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => selectAnswer(currentQuestion.questionId, index)}
                style={{
                  backgroundColor: isSelected ? '#dcfce7' : '#ffffff',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? '#16a34a' : '#e5e7eb'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? '#16a34a' : '#9ca3af',
                    backgroundColor: isSelected ? '#16a34a' : 'transparent',
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                  <Text style={{
                    fontSize: 16,
                    color: isSelected ? '#15803d' : '#374151',
                    fontWeight: isSelected ? '600' : '400',
                    flex: 1
                  }}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 24,
          paddingTop: 24,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb'
        }}>
          <TouchableOpacity
            onPress={previousQuestion}
            disabled={currentQuestionIndex === 0}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: currentQuestionIndex === 0 ? '#e5e7eb' : '#16a34a',
              opacity: currentQuestionIndex === 0 ? 0.5 : 1
            }}
          >
            <Text style={{
              color: currentQuestionIndex === 0 ? '#9ca3af' : '#16a34a',
              fontWeight: '600'
            }}>
              Previous
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
            <TouchableOpacity
              onPress={submitQuiz}
              disabled={!isAnswered || submittingQuiz}
              style={{
                backgroundColor: isAnswered ? '#16a34a' : '#e5e7eb',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              {submittingQuiz ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={{
                  color: isAnswered ? '#ffffff' : '#9ca3af',
                  fontWeight: '600'
                }}>
                  Submit Quiz
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={nextQuestion}
              disabled={!isAnswered}
              style={{
                backgroundColor: isAnswered ? '#16a34a' : '#e5e7eb',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8
              }}
            >
              <Text style={{
                color: isAnswered ? '#ffffff' : '#9ca3af',
                fontWeight: '600'
              }}>
                Next
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderQuizResult = () => {
    if (!quizResult || !selectedQuiz) return null;

    return (
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Result Header */}
        <View style={{
          backgroundColor: quizResult.passed ? '#dcfce7' : '#fee2e2',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          alignItems: 'center'
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: quizResult.passed ? '#16a34a' : '#dc2626',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <Ionicons
              name={quizResult.passed ? 'checkmark' : 'close'}
              size={48}
              color="#ffffff"
            />
          </View>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: quizResult.passed ? '#15803d' : '#991b1b',
            marginBottom: 8
          }}>
            {quizResult.passed ? 'Congratulations!' : 'Keep Learning!'}
          </Text>
          <Text style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: quizResult.passed ? '#16a34a' : '#dc2626',
            marginBottom: 8
          }}>
            {quizResult.score}%
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6b7280',
            marginBottom: 16
          }}>
            {quizResult.correctAnswers} out of {quizResult.totalQuestions} correct
          </Text>
          <View style={{
            backgroundColor: quizResult.passed ? '#16a34a' : '#dc2626',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20
          }}>
            <Text style={{
              color: '#ffffff',
              fontWeight: '600',
              fontSize: 16
            }}>
              +{quizResult.pointsEarned} Points Earned
            </Text>
          </View>
        </View>

        {/* Detailed Results */}
        <Text style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: 16
        }}>
          Review Answers
        </Text>

        {quizResult.detailedAnswers.map((answer, index) => (
          <View
            key={answer.questionId}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              borderWidth: 2,
              borderColor: answer.isCorrect ? '#16a34a' : '#dc2626'
            }}
          >
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: answer.isCorrect ? '#dcfce7' : '#fee2e2',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12
              }}>
                <Ionicons
                  name={answer.isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={answer.isCorrect ? '#16a34a' : '#dc2626'}
                />
              </View>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1f2937',
                flex: 1
              }}>
                Question {index + 1}
              </Text>
            </View>

            <Text style={{
              fontSize: 16,
              color: '#374151',
              marginBottom: 12,
              fontWeight: '500'
            }}>
              {answer.question}
            </Text>

            <View style={{
              backgroundColor: '#f9fafb',
              padding: 12,
              borderRadius: 8,
              marginBottom: 8
            }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                Your answer:
              </Text>
              <Text style={{
                fontSize: 15,
                color: answer.isCorrect ? '#16a34a' : '#dc2626',
                fontWeight: '500'
              }}>
                {selectedQuiz.questions!.find(q => q.questionId === answer.questionId)?.options[answer.selectedAnswer] || 'Not answered'}
              </Text>
            </View>

            {!answer.isCorrect && (
              <View style={{
                backgroundColor: '#dcfce7',
                padding: 12,
                borderRadius: 8,
                marginBottom: 8
              }}>
                <Text style={{ fontSize: 14, color: '#15803d', marginBottom: 4 }}>
                  Correct answer:
                </Text>
                <Text style={{
                  fontSize: 15,
                  color: '#16a34a',
                  fontWeight: '500'
                }}>
                  {selectedQuiz.questions!.find(q => q.questionId === answer.questionId)?.options[answer.correctAnswer]}
                </Text>
              </View>
            )}

            {answer.explanation && (
              <View style={{
                backgroundColor: '#eff6ff',
                padding: 12,
                borderRadius: 8
              }}>
                <Text style={{ fontSize: 14, color: '#1e40af', fontWeight: '500' }}>
                  {answer.explanation}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Action Buttons */}
        <View style={{ marginTop: 24, marginBottom: 40 }}>
          <TouchableOpacity
            onPress={resetQuiz}
            style={{
              backgroundColor: '#16a34a',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <Text style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Take Another Quiz
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowQuizList(false);
              setSelectedContent(Object.keys(contentData)[0] || '');
              setSelectedQuiz(null);
              setQuizSubmitted(false);
              setQuizResult(null);
            }}
            style={{
              backgroundColor: '#ffffff',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#16a34a'
            }}
          >
            <Text style={{
              color: '#16a34a',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Back to Learning
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (selectedQuiz) {
      if (quizSubmitted && quizResult) {
        return renderQuizResult();
      } else {
        return renderQuizQuestion();
      }
    }

    if (showQuizList) {
      return renderQuizList();
    }

    if (contentData[selectedContent]) {
      return (
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 24,
            lineHeight: 36,
            paddingHorizontal: 4
          }}>
            {contentData[selectedContent].title}
          </Text>
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
            marginHorizontal: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 4,
            borderWidth: 1,
            borderColor: '#f1f5f9'
          }}>
            <Text style={{
              fontSize: 16,
              color: '#374151',
              lineHeight: 26,
              letterSpacing: 0.3
            }}>
              {contentData[selectedContent].content}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60
      }}>
        <View style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          padding: 40,
          marginHorizontal: 8,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
          maxWidth: 420,
          width: '100%',
          borderWidth: 1,
          borderColor: '#f1f5f9'
        }}>
          <View style={{
            backgroundColor: '#dcfce7',
            padding: 20,
            borderRadius: 50,
            marginBottom: 24
          }}>
            <Ionicons name="leaf-outline" size={48} color="#16a34a" />
          </View>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: 16,
            textAlign: 'center',
            letterSpacing: 0.5
          }}>
            Welcome to Green Step Education
          </Text>
          <Text style={{
            color: '#6b7280',
            marginBottom: 32,
            textAlign: 'center',
            fontSize: 16,
            lineHeight: 24,
            paddingHorizontal: 8
          }}>
            Select a topic from the menu to start learning about reforestation and environmental conservation.
          </Text>
          <TouchableOpacity
            onPress={() => {
              toggleSection('basics');
              setSidebarOpen(true);
            }}
            style={{
              backgroundColor: '#16a34a',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
              shadowColor: '#16a34a',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
          >
            <Text style={{
              color: '#ffffff',
              fontWeight: '600',
              fontSize: 16,
              letterSpacing: 0.5
            }}>
              Start Learning
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Overlay for Sidebar */}
      {sidebarOpen && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            opacity: overlayAnim,
            zIndex: 1,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setSidebarOpen(false)}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: SIDEBAR_WIDTH,
            backgroundColor: '#ffffff',
            transform: [{ translateX: slideAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 10,
            zIndex: 2,
          }}
        >
          {/* Sidebar Header */}
          <View style={{ 
            padding: 20, 
            borderBottomWidth: 1, 
            borderBottomColor: '#e5e7eb',
            paddingTop: Platform.OS === 'ios' ? 60 : 24,
            backgroundColor: '#f8fafc'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  backgroundColor: '#dcfce7',
                  padding: 8,
                  borderRadius: 12,
                  marginRight: 12
                }}>
                  <Ionicons name="leaf-outline" size={20} color="#16a34a" />
                </View>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '700', 
                  color: '#166534',
                  letterSpacing: 0.3
                }}>
                  Education Center
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setSidebarOpen(false)} 
                style={{ 
                  padding: 8,
                  backgroundColor: '#e2e8f0',
                  borderRadius: 8
                }}
              >
                <Ionicons name="close" size={18} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sidebar Content */}
          <ScrollView 
            style={{ flex: 1, backgroundColor: '#ffffff' }} 
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Quizzes Section */}
            <View style={{ 
              borderBottomWidth: 1, 
              borderBottomColor: '#f1f5f9',
              marginHorizontal: 12,
              marginVertical: 4
            }}>
              <TouchableOpacity
                onPress={handleShowQuizzes}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: 16, 
                  backgroundColor: showQuizList ? '#dcfce7' : '#ffffff',
                  borderRadius: 12,
                  marginBottom: 4
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    backgroundColor: '#fef3c7',
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 16
                  }}>
                    <Ionicons name="trophy-outline" size={18} color="#d97706" />
                  </View>
                  <Text style={{ 
                    fontWeight: '600', 
                    color: '#1e293b', 
                    fontSize: 15,
                    flex: 1,
                    letterSpacing: 0.2
                  }}>
                    Quizzes & Challenges
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#f1f5f9',
                  padding: 6,
                  borderRadius: 6
                }}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color="#64748b" 
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Content Sections */}
            {navigationSections.filter(section => section.items.length > 0).map((section) => (
              <View key={section.id} style={{ 
                borderBottomWidth: 1, 
                borderBottomColor: '#f1f5f9',
                marginHorizontal: 12,
                marginVertical: 4
              }}>
                <TouchableOpacity
                  onPress={() => toggleSection(section.id)}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: 16, 
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    marginBottom: 4
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                      backgroundColor: '#f0f9ff',
                      padding: 8,
                      borderRadius: 8,
                      marginRight: 16
                    }}>
                      <Ionicons name={section.icon} size={18} color="#0369a1" />
                    </View>
                    <Text style={{ 
                      fontWeight: '600', 
                      color: '#1e293b', 
                      fontSize: 15,
                      flex: 1,
                      letterSpacing: 0.2
                    }}>
                      {section.title}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: '#f1f5f9',
                    padding: 6,
                    borderRadius: 6
                  }}>
                    <Ionicons 
                      name={expandedSections[section.id] ? "chevron-down" : "chevron-forward"} 
                      size={16} 
                      color="#64748b" 
                    />
                  </View>
                </TouchableOpacity>
                
                {expandedSections[section.id] && (
                  <View style={{ 
                    paddingBottom: 8,
                    backgroundColor: '#f8fafc',
                    borderRadius: 12,
                    marginTop: -4,
                    paddingTop: 8
                  }}>
                    {section.items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleContentSelect(item.id)}
                        style={{
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          marginHorizontal: 8,
                          marginVertical: 2,
                          backgroundColor: selectedContent === item.id ? '#dcfce7' : 'transparent',
                          borderRadius: 8,
                          borderLeftWidth: selectedContent === item.id ? 3 : 0,
                          borderLeftColor: selectedContent === item.id ? '#16a34a' : 'transparent'
                        }}
                      >
                        <Text style={{
                          fontSize: 14,
                          color: selectedContent === item.id ? '#15803d' : '#64748b',
                          fontWeight: selectedContent === item.id ? '600' : '400',
                          letterSpacing: 0.1,
                          paddingLeft: 16
                        }}>
                          {item.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          backgroundColor: '#ffffff',
          paddingHorizontal: 20,
          paddingVertical: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <TouchableOpacity
            onPress={() => setSidebarOpen(true)}
            style={{
              padding: 12,
              marginRight: 16,
              borderRadius: 8,
              backgroundColor: '#f9fafb'
            }}
          >
            <Ionicons name="menu" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#166534',
            flex: 1,
            letterSpacing: 0.5
          }}>
            Green Step Education
          </Text>
          {selectedQuiz && !quizSubmitted && (
            <TouchableOpacity
              onPress={exitQuiz}
              style={{
                padding: 8,
                backgroundColor: '#fee2e2',
                borderRadius: 8
              }}
            >
              <Ionicons name="close" size={20} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable Content */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>
              Loading educational content...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        )}
      </View>

      {/* Chatbot Button */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 10,
          right: 150,
          transform: [{ translateY: chatButtonTranslateY }],
          zIndex: 999
        }}
      >
        <TouchableOpacity
          onPress={() => setChatbotOpen(!chatbotOpen)}
          style={{
            backgroundColor: '#373435',
            borderRadius: 50,
            paddingHorizontal: 25,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            borderWidth: 0.5,
            borderColor: '#727376'
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600' }}>Max</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Chatbot Window */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#373435',
          zIndex: 1000,
          transform: [{ scale: chatScaleAnim }],
          opacity: chatScaleAnim,
        }}
        pointerEvents={chatbotOpen ? 'auto' : 'none'}
      >
        {/* Chat Header */}
        <View style={{
          backgroundColor: '#000000',
          paddingHorizontal: 20,
          paddingVertical: 18,
          paddingTop: Platform.OS === 'ios' ? 50 : 18,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#373435'
        }}>
          <View>
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700', letterSpacing: 0.5 }}>Max</Text>
            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>AI Assistant</Text>
          </View>
          <TouchableOpacity
            onPress={() => setChatbotOpen(false)}
            style={{
              backgroundColor: '#373435',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        {chatMessages.length > 0 ? (
          <ScrollView
            ref={chatScrollRef}
            style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#101010' }}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <View style={{ backgroundColor: '#8f8f8f', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 5, borderWidth: 1, borderColor: '#6b7280' }}>
                <Text style={{ color: '#1f2937', fontSize: 11 }}>Today</Text>
              </View>
            </View>
            {chatMessages
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((msg, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 16
                  }}
                >
                  <View style={{
                    maxWidth: '85%',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: msg.type === 'user' ? '#808080' : '#ffffff',
                    borderWidth: 1,
                    borderColor: msg.type === 'user' ? '#1D1D1D' : '#6b7280',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 3
                  }}>
                    <Text style={{
                      fontSize: 15,
                      color: '#000000',
                      lineHeight: 22,
                      letterSpacing: 0.2
                    }}>
                      {parseMessageToJSX(msg.message)}
                    </Text>
                  </View>
                </View>
              ))}

            {typing && <TypingIndicator />}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#101010', paddingHorizontal: 20 }}>
            <View style={{ marginHorizontal: 20, paddingHorizontal: 10, marginVertical: 20 }}>
              <Text style={{ color: '#d1d5db', fontSize: 16, marginBottom: 12, textAlign: 'center', lineHeight: 24 }}>
                Hello! I'm Max, an AI-powered assistant for Green Step Education.
              </Text>
              <Text style={{ color: '#d1d5db', fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
                I'm here to guide you through reforestation topics and answer any questions you have about environmental conservation. Let's explore together!
              </Text>
            </View>
          </View>
        )}

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            padding: 16,
            paddingBottom: Platform.OS === 'ios' ? 30 : 16,
            borderTopWidth: 1,
            borderTopColor: '#373435',
            backgroundColor: '#000000'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <TextInput
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={sendMessage}
              placeholder="Ask Max..."
              placeholderTextColor="#9ca3af"
              multiline
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: '#000000',
                maxHeight: 120,
                minHeight: 48,
                borderWidth: 1,
                borderColor: '#e5e7eb'
              }}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!chatInput.trim()}
              style={{
                backgroundColor: chatInput.trim() ? '#373435' : '#6b7280',
                marginLeft: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 0.5,
                borderColor: chatInput.trim() ? '#727376' : '#9ca3af',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

export default EducationTab;