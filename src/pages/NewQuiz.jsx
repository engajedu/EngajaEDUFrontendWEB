import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { read, utils } from 'xlsx';
import DarkSwal from '../components/DarkSwal';
import { Alert, Box, Button, Container, Grid, Snackbar, TextField, Typography } from "@mui/material";
import { Save, Upload } from '@mui/icons-material';
import QuestionCheckCard from "../components/QuestionCheckCard";
import api from "../services/api";

export default function NewQuiz() {
    const [quizName, setQuizName] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [visible, setVisible] = useState(false);

    const navigate = useNavigate();

    const fileInputStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        width: '50%',
        margin: '0 auto',
        '& .hidden-input': {
            display: 'none'
        },
        '& .drop-zone': {
            border: '2px dashed #90caf9',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border 0.3s, background-color 0.3s',
            width: '100%',
            '&:hover': {
                backgroundColor: '#000'
            }
        }
    };

    const getSavedUser = () => {
        try {
            const raw = localStorage.getItem('auth:user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
    }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const binaryString = String.fromCharCode.apply(null, data);

            const workbook = read(binaryString, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const sheetData = utils.sheet_to_json(sheet, { header: 1 });

            // Considera apenas as linhas com três valores: enunciado, resposta e tema
            const filteredSheetData = sheetData.filter(line => line.length === 3);

            setQuizData(filteredSheetData);
        };

        reader.readAsArrayBuffer(file);
    };

    const toggleVisibility = () => setVisible(!visible);

    const clearData = () => {
        const fileInput = document.querySelector('#file-input');
        
        if (fileInput) {
            fileInput.value = '';
        }

        setQuizData(null);
    }


    const saveQuiz = async () => {
  try {
    // pega o usuário salvo no storage
    const saved = getSavedUser();
    const usuario = saved?.usuario; // <- será enviado ao backend
    if (!usuario) {
      return DarkSwal.fire({
        title: 'Sessão inválida',
        text: 'Faça login novamente.',
        icon: 'error',
      });
    }

    // monta as questões a partir do arquivo importado
    const savedQuestions = quizData.map(([enunciado, resposta, tema]) => ({
      enunciado,
      resposta,
      tema,
    }));

    // envia o questionário normalmente, porém com ?usuario=... na query
    await api.post(
      '/cadastraQuestionario',
      {
        questionario: {
          nome: quizName,
          descricao: quizDescription,
          questoes: savedQuestions,
        },
      },
      {
        params: { usuario }, // 👈 enviado na query string
        headers: { 'Content-Type': 'application/json' },
      }
    );

    DarkSwal.fire({ title: 'Questionário cadastrado com sucesso!', icon: 'success' });

    setQuizName('');
    setQuizDescription('');
    setQuizData(null);
    navigate('/');
  } catch (error) {
    console.error(error);
    DarkSwal.fire({
      title: 'Não foi possível cadastrar o questionário!',
      text: error?.response?.data?.message || error.message,
      icon: 'error',
    });
  }
};


    return (
        <Box sx={{ textAlign: 'center', mx: 'auto' }}>
            <h2>Novo questionário</h2>

            <Grid container direction="column" spacing={4}>
                <Grid item>
                    <TextField
                        id="quiz"
                        label="Nome do questionário"
                        variant="outlined"
                        required
                        fullWidth
                        value={quizName}
                        onChange={(event) => {
                            setQuizName(event.target.value);
                        }}
                        sx={{ width: '50%' }}
                    />

                </Grid>

                <Grid item>
                    <TextField
                        id="description"
                        label="Descrição do questionário"
                        variant="outlined"
                        required
                        fullWidth
                        value={quizDescription}
                        onChange={(event) => {
                            setQuizDescription(event.target.value);
                        }}
                        sx={{ width: '50%' }}
                    />

                </Grid>

                <Grid item>
                    <Box sx={fileInputStyles}>
                        <input
                            type="file"
                            accept=".xls, .xlsx, .ods, .csv"
                            className="hidden-input"
                            id="file-input"
                            onChange={handleFileUpload}
                        />
                        <label htmlFor="file-input" className="drop-zone">
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    component="span"
                                    startIcon={<Upload />}
                                    sx={{ mb: 1 }}
                                >
                                    Ler planilha de questões
                                </Button>
                                <Typography variant="body1" color="textSecondary">
                                    {quizData
                                        ? 'Arquivo carregado com sucesso!'
                                        : 'Clique para selecionar'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Formatos aceitos: .xls, .xlsx, .ods, .csv
                                </Typography>
                            </Box>
                        </label>
                    </Box>

                    {quizData && (
                        <Container sx={{ my: 4 }}>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '50%', mx: 'auto' }}>
                                <h2>Dados das questões:</h2>
                                {
                                    visible ? (
                                        // <IconButton size="large" color="primary" onClick={toggleVisibility}>
                                        //     <VisibilityOff />
                                        // </IconButton>
                                        <Button variant="text" onClick={toggleVisibility}>Ocultar</Button>
                                    ) : (
                                        // <IconButton size="large" color="primary" onClick={toggleVisibility}>
                                        //     <Visibility />
                                        // </IconButton>
                                        <Button variant="text" onClick={toggleVisibility}>Conferir</Button>
                                    )
                                }

                                {/* <IconButton size="large" color="error" onClick={() => clearData()}>
                                    <Delete />
                                </IconButton> */}

                                <Button variant="text" onClick={() => clearData()}>Apagar</Button>
                            </Box>

                            {
                                visible && (
                                    <>
                                        <h3>Número de questões: {quizData.length}</h3>
                                        <Grid container spacing={4}>

                                            {quizData.map((item, index) => (
                                                <QuestionCheckCard key={index} question={item[0]} answer={item[1]} subject={item[2]} />
                                            ))}

                                        </Grid>
                                    </>
                                )
                            }

                        </Container>
                    )}
                </Grid>

                <Grid item>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        disabled={!quizName || !quizDescription || !quizData}
                        onClick={saveQuiz}>
                        Salvar Questionário
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}
