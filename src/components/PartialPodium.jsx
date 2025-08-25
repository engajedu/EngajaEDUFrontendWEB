import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import api from '../services/api';

export default function PartialPodium({ onNext }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPodium = async () => {
      try {
        const response = await api.get('/retornaPodio');
        //console.log(response);
        setStudents(response.data);

      } catch (error) {
        console.error('Erro ao buscar pódio parcial:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPodium();
  }, []);


  const handleNextQuestion = async () => {
    try {
      onNext();
    } catch (error) {
      console.error('Erro ao liberar próxima questão:', error);
    }
  };

  const getMedalEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography variant="body1" mt={2}>Carregando pódio...</Typography>
      </Box>
    );
  }

  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h4" gutterBottom>Pódio Parcial</Typography>
      <Typography variant="subtitle1" gutterBottom>Top 10 alunos com mais acertos</Typography>

      <Paper elevation={3} sx={{ maxWidth: 500, margin: '20px auto', padding: 2 }}>
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

      <Button
        variant="contained"
        color="primary"
        onClick={handleNextQuestion}
        sx={{ mt: 2 }}
      >
        Próxima Questão
      </Button>
    </Box>
  );
}
