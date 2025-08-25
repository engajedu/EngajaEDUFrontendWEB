import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import api from "../services/api";

export default function Final({ onFinishResults }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPodium = () => {
      const id = setInterval(async () => {
        try {
          const response = await api.get('/retornaPodio');
          setStudents(response.data);
          setLoading(false);
        } catch (error) {
          console.error('Erro ao buscar pódio final:', error);
        }
      }, 3000);

      setIntervalId(id);
    };

    getPodium();
  }, []);

  const handleEnd = async () => {
    if (intervalId) clearInterval(intervalId);
    onFinishResults();
    await api.get('/limparEstado');
    navigate('/');
  };

  const getMedalEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  return (
    <Stack spacing={4} sx={{ alignItems: 'center', mt: 4 }}>
      <Typography variant="h4">Questionário finalizado</Typography>
      <Typography variant="h6" color="text.secondary">
        Veja o desempenho dos alunos no ranking final:
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper elevation={3} sx={{ maxWidth: 500, width: '90%', maxHeight: 400, overflowY: 'auto', p: 2 }}>
          <List>
            {students.slice(0, 10).map((student, index) => (
              <ListItem key={student.matricula} divider>
                <ListItemText
                  primary={`${getMedalEmoji(index)} ${index + 1}º - ${student.nome}`}
                  secondary={`${student.pontuacao} acerto${student.pontuacao === 1 ? '' : 's'}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Button variant="contained" onClick={handleEnd}>
        Encerrar
      </Button>
    </Stack>
  );
}
