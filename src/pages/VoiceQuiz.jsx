import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DarkSwal from '../components/DarkSwal';
import AudioProcessingProgress from '../components/AudioProcessingProgress';
import ChunkRetryIndicator from '../components/ChunkRetryIndicator';
import { 
    Alert, 
    Box, 
    Button, 
    Grid, 
    TextField, 
    Typography, 
    Paper
} from "@mui/material";
import { 
    AutoAwesome, 
    Mic
} from '@mui/icons-material';
import useAudioProcessing from "../hooks/useAudioProcessing";

export default function VoiceQuiz() {
    const [quizName, setQuizName] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [audioFileName, setAudioFileName] = useState('');

    const navigate = useNavigate();    // Usar o hook personalizado para gerenciar o processamento de áudio
    const {
        isProcessing,
        currentStep,
        progress,
        error,
        questionsGenerated,
        transcription,
        transcriptionLoss,
        steps,
        chunkStates,
        retryAttempts,
        processAudio,
        resetState,
        cleanup,
        getCurrentStepInfo,
        getOverallProgress,
        isComplete,
        hasStuckChunks
    } = useAudioProcessing();

    // Limpar recursos quando o componente for desmontado
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

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
            border: '2px dashed #9c27b0',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border 0.3s, background-color 0.3s',
            width: '100%',
            '&:hover': {
                backgroundColor: 'rgba(156, 39, 176, 0.04)'
            }
        }
    };

    const handleAudioUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioFile(file);
            setAudioFileName(file.name);
            resetState(); // Resetar estado do processamento
        }
    };

    const handleProcessAudio = async () => {
        const success = await processAudio(audioFile, quizName, quizDescription);
        if (!success) {
            // O hook já mostra o erro apropriado
            return;
        }
    };

    const proceedToSelection = () => {
        const generatedQuestions = JSON.parse(localStorage.getItem('generatedQuestions') || '{}');
        const storedTranscriptionLoss = JSON.parse(localStorage.getItem('transcriptionLoss') || '{"hasLoss": false}');
        
        if (Object.keys(generatedQuestions).length === 0) {
            DarkSwal.fire({
                title: "Erro!",
                text: "Nenhuma questão foi encontrada. Tente processar o áudio novamente.",
                icon: "error"
            });
            return;
        }
        
        cleanup(); // Limpar intervalos antes de navegar
        
        navigate('/quizzes/voice/select', {
            state: {
                quizName,
                quizDescription,
                audioFileName,
                questionsData: generatedQuestions,
                transcriptionLoss: transcriptionLoss || storedTranscriptionLoss
            }
        });
    };    // Renderizar indicador de progresso usando o componente especializado
    const renderProgressIndicator = () => {
        return (
            <AudioProcessingProgress
                isProcessing={isProcessing}
                isComplete={isComplete}
                currentStep={currentStep}
                steps={steps}
                progress={progress}
                error={error}
                getCurrentStepInfo={getCurrentStepInfo}
                getOverallProgress={getOverallProgress}
            />
        );
    };

    return (
        <Box sx={{ textAlign: 'center', mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Novo questionário por áudio
            </Typography>

            <Grid container direction="column" spacing={4}>
                <Grid item>
                    <TextField
                        id="quiz"
                        label="Nome do questionário"
                        variant="outlined"
                        required
                        fullWidth
                        value={quizName}
                        onChange={(event) => setQuizName(event.target.value)}
                        sx={{ width: '50%' }}
                        disabled={isProcessing}
                    />
                </Grid>

                <Grid item>
                    <TextField
                        id="description"
                        label="Descrição do questionário"
                        variant="outlined"
                        required
                        fullWidth
                        multiline
                        rows={3}
                        value={quizDescription}
                        onChange={(event) => setQuizDescription(event.target.value)}
                        sx={{ width: '50%' }}
                        disabled={isProcessing}
                    />
                </Grid>

                <Grid item>
                    <Box sx={fileInputStyles}>
                        <input
                            type="file"
                            accept=".mp3, .mp4, .mpeg, .mpga, .m4a, .wav, .webm"
                            className="hidden-input"
                            id="audio-input"
                            onChange={handleAudioUpload}
                            disabled={isProcessing}
                        />
                        <label htmlFor="audio-input" className="drop-zone">
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    component="span"
                                    startIcon={<Mic />}
                                    sx={{ 
                                        mb: 1, 
                                        backgroundColor: '#9c27b0', 
                                        '&:hover': { backgroundColor: '#7b1fa2' } 
                                    }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Processando...' : 'Selecionar áudio'}
                                </Button>
                                <Typography variant="body1" color="textSecondary">
                                    {audioFileName
                                        ? `Arquivo: ${audioFileName}`
                                        : 'Clique para selecionar um arquivo de áudio'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Formatos aceitos: mp3, mp4, mpeg, mpga, m4a, wav, webm (máx. 200MB)
                                </Typography>
                            </Box>
                        </label>
                    </Box>                </Grid>

                {/* Indicador de progresso */}
                <Grid item>
                    {renderProgressIndicator()}
                </Grid>

                {/* Indicador de retry de chunks */}
                {isProcessing && currentStep === 2 && (
                    <Grid item sx={{ width: '100%' }}>
                        <ChunkRetryIndicator
                            chunkStates={chunkStates}
                            retryAttempts={retryAttempts}
                            progress={progress}
                            isVisible={isProcessing && currentStep === 2}
                        />
                    </Grid>
                )}

                {/* Status de sucesso */}
                {questionsGenerated && !isProcessing && (
                    <Grid item>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" color="success.main">
                                ✅ Questões geradas com sucesso!
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Arquivo: {audioFileName}
                            </Typography>
                            {transcription && (
                                <Typography variant="caption" color="textSecondary">
                                    Transcrição completa ({transcription.length} caracteres)
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                )}

                {/* Botões de ação */}
                <Grid item>
                    {!questionsGenerated ? (
                        <Button
                            variant="contained"
                            startIcon={<AutoAwesome />}
                            disabled={!quizName || !quizDescription || !audioFile || isProcessing}
                            onClick={handleProcessAudio}
                            sx={{ 
                                backgroundColor: '#9c27b0', 
                                '&:hover': { backgroundColor: '#7b1fa2' },
                                padding: '12px 24px',
                                fontSize: '1.1rem'
                            }}
                        >
                            {isProcessing ? 'Processando...' : 'Processar Áudio'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={proceedToSelection}
                            sx={{ 
                                backgroundColor: '#4caf50', 
                                '&:hover': { backgroundColor: '#45a049' },
                                padding: '12px 24px',
                                fontSize: '1.1rem'
                            }}
                        >
                            Selecionar Questões
                        </Button>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
