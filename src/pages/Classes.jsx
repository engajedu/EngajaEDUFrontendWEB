import { Grid, Skeleton, Box, Typography, Fab, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useClasses from '../hooks/useClasses';
import ClassCard from '../components/ClassCard';
import { useState } from 'react';
import NewQuiz from './NewQuiz';
import NewQuestion from './NewQuestion'; 

export default function Classes() {
    const { classes } = useClasses();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentScreen, setCurrentScreen] = useState('classes');

    const handleNewQuiz = () => {
        setModalVisible(false);
        setCurrentScreen('newQuiz');
    };

    const handleNewQuestion = () => {
        setModalVisible(false);
        setCurrentScreen('newQuestion');
    };

    if (currentScreen === 'newQuiz') {
        return <NewQuiz goBack={() => setCurrentScreen('classes')} />;
    }

    if (currentScreen === 'newQuestion') {
        return <NewQuestion goBack={() => setCurrentScreen('classes')} />;
    }

    if (!classes) {
        return (
            <Box m={2}>
                <Typography variant="h4" sx={{ my: 4 }}>Carregando turmas...</Typography>
                <Grid container spacing={4}>
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
            </Box>
        );
    }

    return (
        <Box m={2}>
            <Typography variant="h4" sx={{ my: 4 }}>Minhas turmas</Typography>
            <Grid container spacing={4}>
                {classes.length > 0 ? (
                    classes.map(classObject => (
                        <ClassCard classroom={classObject} key={classObject._id} />
                    ))
                ) : (
                    <Typography variant="h6">Nenhuma turma encontrada.</Typography>
                )}
            </Grid>
            <Fab
                color="secondary"
                aria-label="novo item"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                }}
                onClick={() => setModalVisible(true)}
            >
                <AddIcon />
            </Fab>
            {modalVisible && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        width: '300px',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Adicionar Novo
                    </Typography>
                    <Button
                        onClick={handleNewQuiz}
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        Novo Questionário
                    </Button>
                    <Button
                        onClick={handleNewQuestion}
                        variant="contained"
                        color="secondary"
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        Nova Questão
                    </Button>
                    <Button
                        onClick={() => setModalVisible(false)}
                        variant="outlined"
                        fullWidth
                    >
                        Cancelar
                    </Button>
                </Box>
            )}
        </Box>
    );
}
