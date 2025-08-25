import React from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Typography,
    Chip,
    List,
    ListItem,
    ListItemText,
    Collapse,
    IconButton,
    Paper
} from '@mui/material';
import {
    Warning,
    ExpandMore,
    ExpandLess,
    Info,
    ErrorOutline
} from '@mui/icons-material';

const TranscriptionLossAlert = ({ transcriptionLoss, onRetry }) => {
    const [expanded, setExpanded] = React.useState(false);

    if (!transcriptionLoss.hasLoss) {
        return (
            <Alert severity="success" sx={{ mb: 2 }}>
                <AlertTitle>Transcrição Completa</AlertTitle>
                Todos os {transcriptionLoss.totalChunks} chunks foram transcritos com sucesso!
            </Alert>
        );
    }

    const getSeverity = () => {
        if (transcriptionLoss.lossRate > 50) return 'error';
        if (transcriptionLoss.lossRate > 20) return 'warning';
        return 'info';
    };

    const getIcon = () => {
        if (transcriptionLoss.lossRate > 50) return <ErrorOutline />;
        if (transcriptionLoss.lossRate > 20) return <Warning />;
        return <Info />;
    };

    const getMessage = () => {
        if (transcriptionLoss.lossRate > 50) {
            return `Perda crítica de conteúdo! ${transcriptionLoss.lossRate.toFixed(1)}% do áudio não foi transcrito.`;
        }
        if (transcriptionLoss.lossRate > 20) {
            return `Perda significativa de conteúdo. ${transcriptionLoss.lossRate.toFixed(1)}% do áudio não foi transcrito.`;
        }
        return `Pequena perda de conteúdo. ${transcriptionLoss.lossRate.toFixed(1)}% do áudio não foi transcrito.`;
    };

    const getRecommendation = () => {
        if (transcriptionLoss.lossRate > 50) {
            return "⚠️ RECOMENDAÇÃO: As questões podem estar muito incompletas. Considere tentar novamente.";
        }
        if (transcriptionLoss.lossRate > 20) {
            return "💡 RECOMENDAÇÃO: As questões podem estar incompletas. Verifique se cobrem o conteúdo esperado.";
        }
        return "ℹ️ As questões devem estar em sua maioria completas, mas verifique se não faltam tópicos importantes.";
    };

    return (
        <Paper elevation={2} sx={{ mb: 2, p: 0 }}>
            <Alert 
                severity={getSeverity()} 
                icon={getIcon()}
                action={
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                        sx={{ color: 'inherit' }}
                    >
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                }
            >
                <AlertTitle>
                    {transcriptionLoss.isSignificant ? '⚠️ Conteúdo Perdido na Transcrição' : 'ℹ️ Transcrição Parcial'}
                </AlertTitle>
                <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {getMessage()}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip 
                            size="small" 
                            label={`${transcriptionLoss.transcribedChunks}/${transcriptionLoss.totalChunks} chunks`}
                            color={transcriptionLoss.lossRate > 20 ? 'error' : 'warning'}
                            variant="outlined"
                        />
                        <Chip 
                            size="small" 
                            label={`${transcriptionLoss.lostChunks} perdidos`}
                            color="error"
                        />
                        <Chip 
                            size="small" 
                            label={`${(100 - transcriptionLoss.lossRate).toFixed(1)}% transcrito`}
                            color={transcriptionLoss.lossRate > 20 ? 'warning' : 'success'}
                        />
                    </Box>
                </Box>
            </Alert>

            <Collapse in={expanded}>
                <Box sx={{ p: 2, pt: 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {getRecommendation()}
                    </Typography>

                    {transcriptionLoss.failedChunks.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Chunks que falharam:
                            </Typography>
                            <List dense sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                                {transcriptionLoss.failedChunks.map((failedChunk, index) => (
                                    <ListItem key={index} sx={{ py: 0.5 }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {failedChunk.chunk}
                                                    </Typography>
                                                    <Chip size="small" label="ERRO" color="error" />
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="caption" color="error">
                                                    {failedChunk.error || 'Erro desconhecido'}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            <strong>💡 O que isso significa:</strong><br/>
                            • As questões foram geradas apenas com base no conteúdo transcrito<br/>
                            • Tópicos presentes nos chunks perdidos podem não estar incluídos<br/>
                            • A qualidade da avaliação pode estar comprometida se a perda for significativa<br/>
                            • Chunks podem falhar por timeout, corrupção ou problemas de conectividade
                        </Typography>
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default TranscriptionLossAlert;
