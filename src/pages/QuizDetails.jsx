// QuizDetailScreen.js
import { useState, useEffect } from 'react';
import { Typography, Container, Grid, CircularProgress, Box, Fab } from '@mui/material';
import { utils, writeFile } from 'xlsx';
import api from '../services/api';
import { useQuizClass } from '../contexts/QuizClassContext';
import QuestionCard from '../components/QuestionCard';
import { InsertDriveFile } from '@mui/icons-material';

const fabStyle = {
    position: 'fixed',
    bottom: 50,
    right: 50,
    padding: 4
};

export default function QuizDetails() {
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const { quizCode } = useQuizClass();

    useEffect(() => {
        async function getQuiz() {
            await api.post('/carregaQuestionario', JSON.stringify({ codigoQuestionario: quizCode }))
                .then(response => {
                    setSelectedQuiz(response.data)
                })
                .catch(error => console.error(error))
        }

        getQuiz();
    }, []);

    const getFileName = () => {
        const now = new Date();

        const formattedDate = now.toLocaleDateString().replace(/\//g, '-');
        const formattedTime = now.toLocaleTimeString().replace(/:/g, '-');

        const timestamp = `${formattedDate}_${formattedTime}`;

        const fileName = `questoes_${timestamp}.xlsx`;

        return fileName;
    }

    const exportToExcel = (data) => {
        const filename = getFileName();
        const rows = data.map((item) => Object.values(item));
        const worksheet = utils.aoa_to_sheet(rows);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        writeFile(workbook, filename);
    };

    //usar moment pra nomear arquivo
    const exportQuizData = (questions) => {
        const data = questions.map(({ enunciado, resposta, tema }) => ({
            enunciado,
            resposta,
            tema
        }));

        exportToExcel(data);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            {
                !selectedQuiz ? (
                    <CircularProgress />
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h4" component="div" sx={{ mb: 2 }}>
                                {selectedQuiz.nome}
                            </Typography>

                            <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                                {selectedQuiz.descricao}
                            </Typography>

                            <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                                Número de Questões: {selectedQuiz.questoes.length}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sx={{ mb: 10 }}>
                            {selectedQuiz.questoes.map((item, index) => (
                                <QuestionCard key={index} question={item.enunciado} subject={item.tema} answer={item.resposta} />
                            ))}
                        </Grid>

                        <Fab variant="extended" color="success" aria-label="Exportar como excel" sx={fabStyle} onClick={() => exportQuizData(selectedQuiz.questoes)}>
                            <InsertDriveFile sx={{ mr: 1 }} />
                            Exportar questões
                        </Fab>
                    </Grid>
                )
            }
        </Container>
    );
}