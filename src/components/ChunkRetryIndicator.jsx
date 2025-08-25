import { Box, Typography, Chip, Alert, LinearProgress, Collapse } from '@mui/material';
import { Warning, Refresh, CheckCircle, Error } from '@mui/icons-material';

export default function ChunkRetryIndicator({ 
    chunkStates, 
    retryAttempts, 
    progress,
    isVisible = true 
}) {
    if (!isVisible || !chunkStates || Object.keys(chunkStates).length === 0) {
        return null;
    }

    const totalChunks = progress.total || Object.keys(chunkStates).length;
    const completedChunks = Object.values(chunkStates).filter(state => state === 'completed').length;
    const processingChunks = Object.values(chunkStates).filter(state => state === 'processing').length;
    const errorChunks = Object.values(chunkStates).filter(state => state === 'error').length;
    
    const hasRetries = Object.values(retryAttempts).some(attempts => attempts > 0);
    const maxRetries = Math.max(...Object.values(retryAttempts), 0);

    const getChunkStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'primary';
            case 'error': return 'error';
            case 'pending': return 'default';
            default: return 'default';
        }
    };

    const getChunkStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle />;
            case 'processing': return <Refresh className="rotating" />;
            case 'error': return <Error />;
            default: return null;
        }
    };

    return (
        <Collapse in={isVisible}>
            <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                    Status dos Chunks
                </Typography>
                
                {/* Resumo geral */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        label={`${completedChunks}/${totalChunks} Concluídos`}
                        color="success"
                        variant="outlined"
                        icon={<CheckCircle />}
                    />
                    {processingChunks > 0 && (
                        <Chip 
                            label={`${processingChunks} Processando`}
                            color="primary"
                            variant="outlined"
                            icon={<Refresh className="rotating" />}
                        />
                    )}
                    {errorChunks > 0 && (
                        <Chip 
                            label={`${errorChunks} Erros`}
                            color="error"
                            variant="outlined"
                            icon={<Error />}
                        />
                    )}
                </Box>

                {/* Indicador de retry */}
                {hasRetries && (
                    <Alert 
                        severity="info" 
                        icon={<Refresh />}
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="body2">
                            Sistema de retry automático ativo. 
                            {maxRetries > 0 && ` Máximo de tentativas detectadas: ${maxRetries}`}
                        </Typography>
                    </Alert>
                )}

                {/* Progresso visual */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                            Progresso da Transcrição
                        </Typography>
                        <Typography variant="body2">
                            {Math.round((completedChunks / totalChunks) * 100)}%
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={(completedChunks / totalChunks) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>

                {/* Lista detalhada de chunks (limitada) */}
                {progress.chunks && progress.chunks.length <= 20 && (
                    <Box>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Status Individual dos Chunks:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {progress.chunks.map((chunk, index) => {
                                const retries = retryAttempts[chunk.id] || 0;
                                return (
                                    <Chip
                                        key={chunk.id}
                                        label={`${chunk.id}${retries > 0 ? ` (${retries}x)` : ''}`}
                                        size="small"
                                        color={getChunkStatusColor(chunk.status)}
                                        variant={chunk.status === 'processing' ? 'filled' : 'outlined'}
                                        icon={getChunkStatusIcon(chunk.status)}
                                        sx={{ 
                                            fontSize: '0.7rem',
                                            '& .rotating': {
                                                animation: 'spin 1s linear infinite'
                                            }
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                )}

                {/* Muitos chunks - resumo simplificado */}
                {progress.chunks && progress.chunks.length > 20 && (
                    <Typography variant="body2" color="textSecondary">
                        {totalChunks} chunks no total - muito numerosos para exibir individualmente
                    </Typography>
                )}

                {/* CSS para animação de rotação movido para sx prop */}
                <style>
                    {`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                        .rotating {
                            animation: spin 1s linear infinite;
                        }
                    `}
                </style>
            </Box>
        </Collapse>
    );
}
