import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button, Card, CardActionArea, CardActions, CardContent,
    CardMedia, Grid, IconButton, Typography, Box
} from "@mui/material";
import { Edit, Delete } from '@mui/icons-material';
import api from '../services/api';
import { useQuizClass } from "../contexts/QuizClassContext";
import getRandomImage from "../utils/getRandomImage";
import DarkSwal from '../components/DarkSwal';


const QuizCard = ({ quiz, onMainClick, onSecondaryClick, onRefresh }) => {
    const navigate = useNavigate();
    const { setQuizCode } = useQuizClass();
    const randomImage = useMemo(() => getRandomImage('quiz'), []);

    const openEdit = (quiz) => {
        setQuizCode(quiz.codigo);
        navigate(`/quizzes/${quiz._id}/edit`);
    }

    const handleDelete = async () => {
        DarkSwal.fire({
            title: "Tem certeza?",
            text: "Excluir questionário?",
            icon: "warning",
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Sim, excluir",
            confirmButtonColor: '#d33',
            reverseButtons: true
        }).then(async (result) => {
            if(result.isConfirmed) {
                await api.post('/deletarQuestionario', JSON.stringify({
                    codigoQuestionario: quiz.codigo
                }))
                    .then(response => {
                        DarkSwal.fire({
                            title: "Questionário excluído com sucesso!",
                            icon: "success"   
                        })

                        onRefresh();
                    })
                    .catch(error => {
                        DarkSwal.fire({
                            tile: "Houve um erro!",
                            title: "Não foi possível excluir questionário!",
                            icon: "error" 
                        })

                        console.error(error);
                    });
            }
        })
    };

    return (
        <Grid item xs={12} md={6} lg={4} xl={3}>
            <Box sx={{ height: '100%' }}> 
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardActionArea onClick={onSecondaryClick}>
                    <CardMedia
                        component="img"
                        height="140"
                        image={randomImage}
                        alt={quiz.descricao}
                        sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                        <Typography gutterBottom variant="h5" component="div">
                            {quiz.nome}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {quiz.descricao}
                        </Typography>

                    </CardContent>
                </CardActionArea>

                <CardActions sx={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Button color="primary" onClick={onMainClick}>
                        Iniciar
                    </Button>

                    <IconButton color="info" aria-label="Editar questionário" onClick={() => openEdit(quiz)}>
                        <Edit />
                    </IconButton>

                    <IconButton color="error" aria-label="Excluir questionário" onClick={handleDelete}>
                        <Delete />
                    </IconButton>

                </CardActions>
            </Card>
            </Box>
        </Grid>

    )
}

export default QuizCard;