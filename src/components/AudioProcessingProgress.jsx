import React from 'react';
import {
    Box,
    Typography,
    LinearProgress,
    Paper,
    Step,
    StepLabel,
    Stepper,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import {
    CloudUpload,
    ContentCut,
    Transcribe,
    MergeType,
    Psychology,
    CheckCircle
} from '@mui/icons-material';

const AudioProcessingProgress = ({
    isProcessing,
    isComplete,
    currentStep,
    steps,
    progress,
    error,
    getCurrentStepInfo,
    getOverallProgress
}) => {
    if (!isProcessing && !isComplete) return null;

    const currentStepInfo = getCurrentStepInfo();

    const stepIcons = {
        0: <CloudUpload />,
        1: <ContentCut />,
        2: <Transcribe />,
        3: <MergeType />,
        4: <Psychology />,
        5: <CheckCircle />
    };

    return (
        <Paper 
            elevation={3}
            sx={{ 
                p: 4, 
                mt: 4, 
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid rgba(156, 39, 176, 0.2)'
            }}
        >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary">
                    {isComplete ? "🎉 Processamento Concluído!" : "🎙️ Processando áudio"}
                </Typography>
                
                {!isComplete && (
                    <Chip 
                        icon={stepIcons[currentStep]} 
                        label={currentStepInfo.label}
                        color="primary"
                        variant="outlined"
                        sx={{ mt: 1 }}
                    />
                )}
            </Box>
            
            <Stepper 
                activeStep={currentStep} 
                alternativeLabel 
                sx={{ mb: 4 }}
            >
                {steps.map((step, index) => (
                    <Step 
                        key={index} 
                        completed={index < currentStep || isComplete}
                    >
                        <StepLabel 
                            error={error && currentStep === index}
                            icon={stepIcons[index]}
                        >
                            <Typography variant="caption">
                                {step.label}
                            </Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Progresso geral */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        Progresso geral
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {Math.round(getOverallProgress())}%
                    </Typography>
                </Box>
                <LinearProgress 
                    variant="determinate" 
                    value={getOverallProgress()} 
                    sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        bgcolor: 'rgba(156, 39, 176, 0.1)',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: '#9c27b0'
                        }
                    }}
                />
            </Box>

            {/* Progresso específico da transcrição */}
            {currentStep === 2 && progress.total > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                            Transcrevendo chunks
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {progress.done}/{progress.total}
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={(progress.done / progress.total) * 100} 
                        sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#4caf50'
                            }
                        }}
                    />
                </Box>
            )}

            {/* Status e descrição */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2,
                mt: 2
            }}>
                {isProcessing && (
                    <CircularProgress 
                        size={50} 
                        sx={{ color: '#9c27b0' }}
                    />
                )}
                
                <Typography 
                    variant="body1" 
                    color="textSecondary" 
                    align="center"
                    sx={{ fontStyle: 'italic' }}
                >
                    {isComplete ? 
                        "✅ Questões geradas com sucesso! Você pode agora selecionar as questões desejadas." : 
                        currentStepInfo.description
                    }
                </Typography>
                
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mt: 2, 
                            width: '100%',
                            '& .MuiAlert-message': {
                                width: '100%'
                            }
                        }}
                    >
                        <Typography variant="body2">
                            <strong>Erro:</strong> {error}
                        </Typography>
                    </Alert>
                )}

                {/* Informações adicionais durante o processamento */}
                {isProcessing && (
                    <Box sx={{ 
                        bgcolor: 'rgba(156, 39, 176, 0.05)', 
                        p: 2, 
                        borderRadius: 1,
                        width: '100%',
                        textAlign: 'center'
                    }}>
                        <Typography variant="caption" color="textSecondary">
                            💡 Este processo pode levar alguns minutos dependendo do tamanho do arquivo
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default AudioProcessingProgress;
