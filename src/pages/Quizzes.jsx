import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid, Button, Fab, Skeleton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, ListItemIcon, ListItemText, List, ListItemButton, Alert, Snackbar, Box, MenuList, Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import MicIcon from '@mui/icons-material/Mic';
import ClassIcon from '@mui/icons-material/School';

import useQuizzes from '../hooks/useQuizzes';
import useClasses from '../hooks/useClasses';

import { useQuizClass } from '../contexts/QuizClassContext';
import QuizCard from '../components/QuizCard';
import { useCallback } from 'react';

const fabStyle = {
    position: 'fixed',
    bottom: 50,
    right: 50,
    padding: 4
};

const fabVoiceStyle = {
    position: 'fixed',
    bottom: 50,
    right: 120,
    padding: 4
};

export default function Quizzes() {
    const [open, setOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { quizzes, loading, error, refetch } = useQuizzes();
    const { classes } = useClasses();
    const { quiz, setQuiz, classRoom, setClassRoom, setQuizCode } = useQuizClass();

    const navigate = useNavigate();

    const handleClickOpen = (quiz) => {
        setOpen(true);
        setClassRoom('');
        setQuiz(quiz);
    };

    const openDetails = (quiz) => {
        setQuizCode(quiz.codigo);
        navigate(`/quizzes/${quiz._id}`);
    }

    const handleClose = () => {
        setOpen(false);
        setClassRoom('');
    };

    const handleListItemClick = (event, classSelected) => {
        setClassRoom(classSelected);
    };

    const beginQuiz = () => {
        setOpen(false);
        navigate(`/quiz?quizId=${quiz._id}&classId=${classRoom._id}`);
    }

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        refetch().finally(() => setRefreshing(false));
    }, [refreshing]);

    return (
        <Box m={2}>
            {/* Estado de loading */}
            {loading && (
                <Typography variant="h4" sx={{ my: 4 }}>Carregando questionários...</Typography>
            )}

            {/* Estado de erro */}
            {error && (
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" sx={{ mb: 2 }}>Erro ao carregar questionários</Typography>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body1">{error.message}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Código: {error.code || 'N/A'} | Status: {error.status || 'N/A'}
                        </Typography>
                    </Alert>
                    <Button variant="contained" onClick={() => refetch()}>
                        Tentar novamente
                    </Button>
                </Box>
            )}

            {/* Estado de sucesso */}
            {!loading && !error && (
                <Typography variant="h4" sx={{ my: 4 }}>
                    {quizzes?.length > 0 ? 'Meus questionários' : 'Nenhum questionário encontrado'}
                </Typography>
            )}

            <Grid container spacing={4} sx={{ mb: 15 }}>

                {
                    quizzes && !loading && !error ? (
                        quizzes.map(quiz => (
                            <QuizCard
                                quiz={quiz}
                                onMainClick={() => handleClickOpen(quiz)}
                                onSecondaryClick={() => openDetails(quiz)}
                                key={quiz.codigo}
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                            />
                        ))) : (
                        <Grid container spacing={4} direction="row" sx={{ marginLeft: 2, marginTop: 4 }}>
                            <Grid item xs={3}>
                                <Skeleton variant="rectangular" width={300} height={200} />
                            </Grid>
                            <Grid item xs={3}>
                                <Skeleton variant="rectangular" width={300} height={200} />
                            </Grid>
                            <Grid item xs={3}>
                                <Skeleton variant="rectangular" width={300} height={200} />
                            </Grid>
                            <Grid item xs={3}>
                                <Skeleton variant="rectangular" width={300} height={200} />
                            </Grid>
                        </Grid>
                    )
                }

            </Grid>            <Fab color="secondary" aria-label="novo quiz" sx={fabStyle} LinkComponent={Link} to='/quizzes/new'>
                <AddIcon />
            </Fab>

            <Fab color="primary" aria-label="quiz por voz" sx={fabVoiceStyle} LinkComponent={Link} to='/quizzes/voice'>
                <MicIcon />
            </Fab>

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        beginQuiz();
                    },
                }}
            >
                <DialogTitle>Iniciar Questionário</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Selecione para qual turma iniciar o questionário
                    </DialogContentText>

                    <List>
                        {
                            classes?.map((classItem) => (
                                <ListItemButton
                                    selected={classRoom.codigo === classItem.codigo}
                                    onClick={(event) => handleListItemClick(event, classItem)}
                                    key={classItem._id}
                                >
                                    <ListItemIcon>
                                        <ClassIcon />
                                    </ListItemIcon>

                                    <ListItemText primary={classItem.nome} />

                                </ListItemButton>

                            ))
                        }

                    </List>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button type="submit" disabled={classRoom === ''}>Aplicar questionário</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}