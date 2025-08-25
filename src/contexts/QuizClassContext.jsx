import { createContext, useState, useContext } from 'react';

const QuizClassContext = createContext();

export const QuizClassProvider = ({ children }) => {
  const [quiz, setQuiz] = useState('');
  const [classRoom, setClassRoom] = useState('');
  const [quizCode, setQuizCode] = useState('');

  return (
    <QuizClassContext.Provider value={{ quiz, setQuiz, classRoom, setClassRoom, quizCode, setQuizCode }}>
      {children}
    </QuizClassContext.Provider>
  );
};

export const useQuizClass = () => {
  return useContext(QuizClassContext);
};
