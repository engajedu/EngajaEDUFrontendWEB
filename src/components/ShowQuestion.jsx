import { useEffect, useState } from "react";
import Typography from '@mui/material/Typography';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import api from '../services/api';
import { Box, Button, CircularProgress, Stack, IconButton } from "@mui/material";
import { RemoveRedEye } from '@mui/icons-material';
import { useQuizClass } from '../contexts/QuizClassContext';
import getReadingTime from '../utils/getReadingTime';
import ProgressBar from "./ProgressBar";
import PartialPodium from "./PartialPodium";

export default function ShowQuestion({ onFinishQuiz }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timeIsOver, setTimeIsOver] = useState(false);
  const [key, setKey] = useState(0);
  const [visible, setVisible] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [showPodium, setShowPodium] = useState(false);

  const { quiz } = useQuizClass();

  const liberarProximaQuestao = async () => {
    await api.get('/liberaProximaQuestao');
    setVisible(false);
    setKey(prevKey => prevKey + 1);
    setTimeIsOver(false);
    setShowSpinner(false);
    setButtonEnabled(false);
    setShowPodium(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const finalizarQuestionario = async () => {
    await api.get('/liberaProximaQuestao');
    onFinishQuiz();
  };

  const renderTime = ({ remainingTime }) => (
    <Typography variant="h4">{remainingTime}</Typography>
  );

  useEffect(() => {
    if (quiz && quiz.questoes && quiz.questoes[currentQuestionIndex]) {
      const readingTime = getReadingTime(quiz.questoes[currentQuestionIndex].enunciado);
      setTimer(readingTime);
    }
  }, [currentQuestionIndex, quiz]);

  useEffect(() => {
    if (timeIsOver) {
      setShowSpinner(true);
      setTimeout(() => {
        setShowSpinner(false);
        setButtonEnabled(true);
      }, 2000);
    }
  }, [timeIsOver]);

  if (showPodium) {
    return <PartialPodium onNext={liberarProximaQuestao} />;
  }

  return (
    <Stack spacing={6} sx={{ mt: 4, justifyContent: "center", alignItems: "center" }}>
      {timeIsOver ? (
        <Typography variant="h5">Tempo esgotado</Typography>
      ) : (
        <CountdownCircleTimer
          key={key}
          isPlaying
          duration={timer}
          size={110}
          strokeWidth={6}
          colors={['#663399', '#93000a']}
          colorsTime={[timer, 0]}
          onComplete={() => setTimeIsOver(true)}
        >
          {renderTime}
        </CountdownCircleTimer>
      )}

      <Typography variant="h5">Questão {currentQuestionIndex + 1} de {quiz.questoes.length}</Typography>
      <ProgressBar current={currentQuestionIndex + 1} target={quiz.questoes.length} />

      <Typography variant="h5">{quiz.questoes[currentQuestionIndex].enunciado}</Typography>

      {!timeIsOver && (
        <Typography variant="h5">
          Responda <span style={{ color: '#1E90FF' }}>Verdadeiro</span> ou <span style={{ color: '#FF4500' }}>Falso</span>
        </Typography>
      )}

      {timeIsOver && (
        <Stack spacing={5} width={'35%'}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <Typography variant="h5" sx={{ mr: 3 }}>Resposta correta:</Typography>
            {visible ? (
              <Box
                onClick={() => setVisible(!visible)}
                sx={{
                  backgroundColor: quiz.questoes[currentQuestionIndex].resposta === 'V' ? '#1E90FF' : '#FF4500',
                  color: 'black',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                {quiz.questoes[currentQuestionIndex].resposta === 'V' ? 'Verdadeiro' : 'Falso'}
              </Box>
            ) : (
              <IconButton
                onClick={() => setVisible(!visible)}
                sx={{
                  background: 'linear-gradient(to right, red 50%, blue 50%)',
                  p: 2,
                  borderRadius: 1,
                  '&:hover': { opacity: 0.8 }
                }}
              >
                <RemoveRedEye sx={{ color: 'white' }} />
              </IconButton>
            )}
          </Box>

          {showSpinner ? (
            <CircularProgress />
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                if (currentQuestionIndex === quiz.questoes.length - 1) {
                  finalizarQuestionario();
                } else {
                  setShowPodium(true);
                }
              }}
              disabled={!buttonEnabled}
              sx={{ mt: 4 }}
            >
              {currentQuestionIndex === quiz.questoes.length - 1 ? 'Finalizar questionário' : 'Continuar'}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
