import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Container,
  Grid,
  Typography,
  Paper,
  Stack
} from "@mui/material";
import GroupIcon from '@mui/icons-material/Group';

import api from '../services/api';
import { useQuizClass } from '../contexts/QuizClassContext';
import getFirstNames from "../utils/getFirstNames";
import '../css/animation.css';
import StudentCard from "./StudentCard";

export default function Lobby({ onStartQuiz }) {
  const [classLoaded, setClassLoaded] = useState(false);
  const [quizLoaded, setQuizLoaded] = useState(false);
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [quizCode, setQuizCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { quiz, setQuiz, classRoom } = useQuizClass();

  useEffect(() => {
    const reset = async () => {
      await api.post('/conectaQuestionario', JSON.stringify({ valor: false }))
        .then((response) => { console.log(response.data) })
        .catch((error) => { console.error(error) });
    };

    const getQuizCode = async () => {
      await api.get('/gerarCodigo').then(response => setQuizCode(response.data));
    };

    const loadQuiz = async () => {
      await api.post('/carregaQuestionario', JSON.stringify({ codigoQuestionario: quiz.codigo }))
        .then(response => {
          setQuiz(response.data);
          setQuizLoaded(true);
        })
        .catch(error => { console.error(error); });
    };

    const loadClass = async () => {
      await api.post('/carregaTurma', JSON.stringify({ codigoTurma: classRoom.codigo }))
        .then(() => setClassLoaded(true))
        .catch(error => { console.error(error); });
    };

    reset();
    loadQuiz();
    loadClass();
    getQuizCode();
  }, []);

  useEffect(() => {
    if (!classLoaded || !quizLoaded) return;

    const getConnectedStudents = async () => {
      await api.get('/alunosConectados')
        .then(response => setConnectedStudents(response.data))
        .catch(error => { console.error(error); });
    };

    const id = setInterval(getConnectedStudents, 3000);
    setIntervalId(id);

    return () => clearInterval(id);
  }, [classLoaded, quizLoaded]);

  const liberarQuestionario = async () => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    await api.post('/conectaQuestionario', JSON.stringify({ valor: true }))
      .then(() => onStartQuiz())
      .catch((error) => { console.error(error); });
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container sx={{ textAlign: 'center' }} >
      {
        isLoading ? (
          <CircularProgress sx={{ mt: 4 }} />
        ) : (
          <>
            <Typography variant="h4" sx={{ my: 4 }}>Código do questionário:</Typography>
            <Typography variant="h3">{quizCode}</Typography>
          </>
        )
      }

      {
        connectedStudents.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline' }}>
            <Typography variant="h4" sx={{ my: 6, mr: 1 }}>
              Aguardando alunos
            </Typography>
            <div className="loading-dots"></div>
          </div>
        ) : (
          <>
            <Paper elevation={3} sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              px: 3,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              mb: 3
            }}>
              <GroupIcon sx={{ fontSize: 36, color: '#3f51b5', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {connectedStudents.length} aluno{connectedStudents.length !== 1 ? 's' : ''} conectad{connectedStudents.length !== 1 ? 'os' : 'o'}
              </Typography>
            </Paper>

            <Grid container spacing={4} direction="row">
              {
                connectedStudents.map(student => (
                  <StudentCard key={student.matricula} student={student} />
                ))
              }
            </Grid>

            <Button
              sx={{ my: 4, mx: 'auto', width: '50%' }}
              variant="contained"
              onClick={liberarQuestionario}>
              Iniciar questionário
            </Button>
          </>
        )
      }
    </Container>
  );
}
