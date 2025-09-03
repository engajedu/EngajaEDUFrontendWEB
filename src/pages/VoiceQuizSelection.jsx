import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
    Box, 
    Button, 
    Container, 
    Typography, 
    Accordion, 
    AccordionSummary, 
    AccordionDetails,
    FormControlLabel,
    Checkbox,
    Grid,
    Chip,
    Paper,
    Divider,
    IconButton,
    Tooltip
} from "@mui/material";
import { 
    ExpandMore, 
    Save, 
    SelectAll, 
    ClearAll,
    QuestionAnswer,
    Edit 
} from '@mui/icons-material';
import DarkSwal from '../components/DarkSwal';
import QuestionEditDialog from '../components/QuestionEditDialog';
import TranscriptionLossAlert from '../components/TranscriptionLossAlert';
import api from "../services/api";

export default function VoiceQuizSelection() {

    const getSavedUser = () => {
        try {
            const raw = localStorage.getItem('auth:user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
    }
    };

    const navigate = useNavigate();
    const location = useLocation();    // Dados vindos da tela anterior ou localStorage como fallback
    const { 
        quizName, 
        quizDescription, 
        audioFileName, 
        questionsData: stateQuestions, 
        transcriptionLoss 
    } = location.state || {};
    
    // Fallback para localStorage se não houver dados no state
    const questionsData = stateQuestions || (() => {
        try {
            return JSON.parse(localStorage.getItem('generatedQuestions') || '{}');
        } catch {
            return {};
        }
    })();

    // Fallback para transcriptionLoss se não houver no state
    const lossData = transcriptionLoss || (() => {
        try {
            return JSON.parse(localStorage.getItem('transcriptionLoss') || '{"hasLoss": false}');
        } catch {
            return { hasLoss: false };
        }
    })();
    
    const [selectedQuestions, setSelectedQuestions] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState({ topic: "", index: -1, question: ["", "Verdadeiro"] });
    const [editedQuestionsData, setEditedQuestionsData] = useState(questionsData);

    // Redirecionar se não houver dados ou questões
    useEffect(() => {
        if (!questionsData || Object.keys(questionsData).length === 0) {
            DarkSwal.fire({
                title: "Dados não encontrados!",
                text: "Não foi possível carregar as questões. Retornando para o início.",
                icon: "error"
            });
            navigate('/quizzes/voice');
        } else {
            // Inicializar os dados editados
            setEditedQuestionsData(questionsData);
        }
    }, [questionsData, navigate]);

    // Inicializar seleções apenas uma vez
    useEffect(() => {
        if (editedQuestionsData && Object.keys(editedQuestionsData).length > 0 && Object.keys(selectedQuestions).length === 0) {
            const initialSelection = {};
            Object.keys(editedQuestionsData).forEach(topic => {
                initialSelection[topic] = {};
                if (Array.isArray(editedQuestionsData[topic])) {
                    editedQuestionsData[topic].forEach((_, index) => {
                        initialSelection[topic][index] = false;
                    });
                }
            });
            setSelectedQuestions(initialSelection);
        }
    }, [editedQuestionsData]);

    const handleQuestionToggle = (topic, questionIndex) => {
        setSelectedQuestions(prev => ({
            ...prev,
            [topic]: {
                ...prev[topic],
                [questionIndex]: !prev[topic][questionIndex]
            }
        }));
    };

    const handleTopicSelectAll = (topic) => {
        setSelectedQuestions(prev => {
            const newTopicSelection = {};
            editedQuestionsData[topic].forEach((_, index) => {
                newTopicSelection[index] = true;
            });
            return {
                ...prev,
                [topic]: newTopicSelection
            };
        });
    };

    const handleTopicDeselectAll = (topic) => {
        setSelectedQuestions(prev => {
            const newTopicSelection = {};
            editedQuestionsData[topic].forEach((_, index) => {
                newTopicSelection[index] = false;
            });
            return {
                ...prev,
                [topic]: newTopicSelection
            };
        });
    };

    const getSelectedQuestionsCount = () => {
        let count = 0;
        Object.keys(selectedQuestions).forEach(topic => {
            Object.values(selectedQuestions[topic] || {}).forEach(selected => {
                if (selected) count++;
            });
        });
        return count;
    };

    const getTopicSelectedCount = (topic) => {
        return Object.values(selectedQuestions[topic] || {}).filter(selected => selected).length;
    };

    // Funções de edição
    const handleEditQuestion = (topic, questionIndex) => {
        setEditingQuestion({
            topic,
            index: questionIndex,
            question: editedQuestionsData[topic][questionIndex]
        });
        setEditDialogOpen(true);
    };

    const handleSaveEditedQuestion = (editedQuestion) => {
        const { topic, index } = editingQuestion;
        setEditedQuestionsData(prev => {
            const newData = { ...prev };
            newData[topic] = [...prev[topic]];
            newData[topic][index] = editedQuestion;
            return newData;
        });
    };

    const saveQuiz = async (usuarioOverride) => {
  // pega o usuário do storage (ou usa o override passado)
        const saved = getSavedUser();
        const usuario = saved?.usuario;

  const selectedCount = getSelectedQuestionsCount();

  if (selectedCount === 0) {
    DarkSwal.fire({
      title: 'Nenhuma questão selecionada!',
      text: 'Por favor, selecione pelo menos uma questão para criar o questionário.',
      icon: 'warning',
    });
    return;
  }

  setIsLoading(true);

  try {
    if (!usuario) {
      throw new Error('Professor não identificado (sem usuário). Faça login novamente.');
    }

    // monta as questões selecionadas para o backend
    const selectedQuestionsForBackend = [];
    Object.keys(selectedQuestions).forEach((topic) => {
      Object.keys(selectedQuestions[topic]).forEach((questionIndex) => {
        if (selectedQuestions[topic][questionIndex]) {
          const question = editedQuestionsData[topic][questionIndex];
          selectedQuestionsForBackend.push({
            enunciado: question[0],
            resposta: question[1] === 'Verdadeiro' ? 'V' : 'F',
            tema: topic,
          });
        }
      });
    });

    // payload do POST
    const payload = {
      questionario: {
        nome: quizName || 'Questionário por Áudio',
        descricao: quizDescription || 'Questionário gerado automaticamente a partir de áudio',
        questoes: selectedQuestionsForBackend,
      },
    };
    console.log(payload);

    // ✅ envia o usuario como query param
    await api.post('/cadastraQuestionario', payload, {
      params: { usuario },
      headers: { 'Content-Type': 'application/json' },
    });

    DarkSwal.fire({
      title: 'Questionário criado com sucesso!',
      text: `${selectedCount} questões foram adicionadas ao questionário.`,
      icon: 'success',
    });

    // limpa dados temporários
    localStorage.removeItem('generatedQuestions');

    navigate('/quizzes');
  } catch (error) {
    console.error(error);
    DarkSwal.fire({
      title: 'Erro ao salvar!',
      text: 'Não foi possível criar o questionário. Tente novamente.',
      icon: 'error',
    });
  } finally {
    setIsLoading(false);
  }
};

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Selecionar Questões
                </Typography>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                    {quizName}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                    {quizDescription}
                </Typography>
                <Chip 
                    icon={<QuestionAnswer />} 
                    label={`Arquivo: ${audioFileName}`} 
                    variant="outlined" 
                    sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="primary">
                    Questões selecionadas: {getSelectedQuestionsCount()}
                </Typography>
            </Box>

            {/* Alerta sobre chunks perdidos na transcrição */}
            {lossData && (
                <TranscriptionLossAlert 
                    transcriptionLoss={lossData}
                />
            )}

            <Grid container spacing={3}>
                {Object.keys(editedQuestionsData).map((topic, topicIndex) => (
                    <Grid item xs={12} key={topicIndex}>
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
                                    <Typography variant="h6">{topic}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip 
                                            label={`${getTopicSelectedCount(topic)}/${editedQuestionsData[topic].length}`}
                                            size="small"
                                            color={getTopicSelectedCount(topic) > 0 ? "primary" : "default"}
                                        />
                                        <Button 
                                            size="small" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTopicSelectAll(topic);
                                            }}
                                            startIcon={<SelectAll />}
                                        >
                                            Todas
                                        </Button>
                                        <Button 
                                            size="small" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTopicDeselectAll(topic);
                                            }}
                                            startIcon={<ClearAll />}
                                        >
                                            Nenhuma
                                        </Button>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {editedQuestionsData[topic].map((question, questionIndex) => (
                                        <Grid item xs={12} key={questionIndex}>
                                            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={selectedQuestions[topic]?.[questionIndex] || false}
                                                                onChange={() => handleQuestionToggle(topic, questionIndex)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={
                                                            <Box>
                                                                <Typography variant="body1" sx={{ mb: 1 }}>
                                                                    {question[0]}
                                                                </Typography>
                                                                <Chip 
                                                                    label={question[1]} 
                                                                    size="small"
                                                                    color={question[1] === "Verdadeiro" ? "success" : "error"}
                                                                    variant="outlined"
                                                                />
                                                            </Box>
                                                        }
                                                        sx={{ width: '100%', alignItems: 'flex-start', flex: 1 }}
                                                    />
                                                    <Tooltip title="Editar questão">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditQuestion(topic, questionIndex)}
                                                            sx={{ 
                                                                color: 'primary.main',
                                                                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                                                            }}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate('/quizzes/voice')}
                    disabled={isLoading}
                >
                    Voltar
                </Button>
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={saveQuiz}
                    disabled={getSelectedQuestionsCount() === 0 || isLoading}
                    sx={{ 
                        backgroundColor: '#4caf50', 
                        '&:hover': { backgroundColor: '#45a049' },
                        padding: '12px 24px'
                    }}
                >
                    {isLoading ? 'Salvando...' : `Criar Questionário (${getSelectedQuestionsCount()} questões)`}
                </Button>
            </Box>

            {/* Dialog de edição */}
            <QuestionEditDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                question={editingQuestion.question}
                onSave={handleSaveEditedQuestion}
                topicName={editingQuestion.topic}
            />
        </Container>
    );
}
