import { useState, useRef, useCallback } from 'react';
import api from '../services/api';
import DarkSwal from '../components/DarkSwal';

/**
 * Hook personalizado para gerenciar o fluxo completo de processamento de áudio
 * Implementa todas as etapas: upload, divisão, transcrição, concatenação e geração de questões
 */
const useAudioProcessing = () => {    // Estados do processamento
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [chunks, setChunks] = useState([]);
    const [transcription, setTranscription] = useState('');
    const [progress, setProgress] = useState({ total: 0, done: 0, status: 'idle' });
    const [error, setError] = useState(null);
    const [questionsGenerated, setQuestionsGenerated] = useState(false);
    
    // Estado para rastrear chunks perdidos na transcrição
    const [transcriptionLoss, setTranscriptionLoss] = useState({
        hasLoss: false,
        lossRate: 0,
        lostChunks: 0,
        totalChunks: 0,
        transcribedChunks: 0,
        isSignificant: false,
        failedChunks: []
    });
    
    // Estados para controle de retry de chunks
    const [chunkStates, setChunkStates] = useState({});
    const [retryAttempts, setRetryAttempts] = useState({});
    const [lastProgressUpdate, setLastProgressUpdate] = useState({});
    
    // Referência para o polling do progresso
    const progressIntervalRef = useRef(null);
    
    // Configurações de timeout e retry
    const CHUNK_TIMEOUT = 120000; // 2 minutos por chunk
    const MAX_RETRY_ATTEMPTS = 3;
    const PROGRESS_CHECK_INTERVAL = 3000; // 3 segundos

    // Etapas do processo
    const steps = [
        { label: 'Upload do áudio', description: 'Enviando arquivo para o servidor...' },
        { label: 'Divisão em chunks', description: 'Dividindo áudio em segmentos...' },
        { label: 'Transcrição', description: 'Transcrevendo áudio com IA...' },
        { label: 'Concatenação', description: 'Concatenando transcrições...' },
        { label: 'Geração de questões', description: 'Gerando questões...' },
        { label: 'Finalizado', description: 'Processo concluído!' }
    ];

    // Limpar intervalos e resetar estado
    const cleanup = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const resetState = useCallback(() => {
        cleanup();
        setIsProcessing(false);
        setCurrentStep(0);
        setSessionId(null);
        setChunks([]);
        setTranscription('');
        setProgress({ total: 0, done: 0, status: 'idle' });
        setError(null);
        setQuestionsGenerated(false);
        setChunkStates({});
        setRetryAttempts({});
        setLastProgressUpdate({});
    }, [cleanup]);

    // Função para retry de chunks específicos
    const retryFailedChunks = useCallback(async (sessionId, failedChunks) => {
        try {
            console.log('🔄 Reprocessando chunks:', failedChunks);
            
            const response = await api.post('/audioSession/retryChunks', {
                sessionId,
                chunks: failedChunks
            });

            if (response.data.success) {
                // Reset dos estados dos chunks que vão ser reprocessados
                setChunkStates(prev => {
                    const newStates = { ...prev };
                    failedChunks.forEach(chunkId => {
                        newStates[chunkId] = 'processing';
                    });
                    return newStates;
                });

                setLastProgressUpdate(prev => {
                    const newUpdates = { ...prev };
                    failedChunks.forEach(chunkId => {
                        newUpdates[chunkId] = Date.now();
                    });
                    return newUpdates;
                });

                return true;
            } else {
                throw new Error('Falha ao reiniciar chunks');
            }
        } catch (error) {
            console.error('❌ Erro ao reprocessar chunks:', error);
            throw error;
        }
    }, []);

    // Função para detectar chunks travados e fazer retry
    const checkAndRetryStuckChunks = useCallback(async (sessionId, currentProgress) => {
        const now = Date.now();
        const chunksToRetry = [];

        // Identificar chunks que podem estar travados
        Object.keys(chunkStates).forEach(chunkId => {
            const chunkState = chunkStates[chunkId];
            const lastUpdate = lastProgressUpdate[chunkId] || now;
            const timeSinceUpdate = now - lastUpdate;
            const currentRetries = retryAttempts[chunkId] || 0;

            // Se o chunk está processando há muito tempo e não teve progresso
            if (chunkState === 'processing' && 
                timeSinceUpdate > CHUNK_TIMEOUT && 
                currentRetries < MAX_RETRY_ATTEMPTS) {
                
                console.log(`⏰ Chunk ${chunkId} travado há ${timeSinceUpdate}ms, iniciando retry ${currentRetries + 1}`);
                chunksToRetry.push(chunkId);
            }
        });

        if (chunksToRetry.length > 0) {
            // Incrementar contador de tentativas
            setRetryAttempts(prev => {
                const newAttempts = { ...prev };
                chunksToRetry.forEach(chunkId => {
                    newAttempts[chunkId] = (prev[chunkId] || 0) + 1;
                });
                return newAttempts;
            });

            // Fazer retry dos chunks travados
            try {
                await retryFailedChunks(sessionId, chunksToRetry);
                return true;
            } catch (error) {
                console.error('❌ Falha no retry automático:', error);
                return false;
            }
        }

        return false;
    }, [chunkStates, lastProgressUpdate, retryAttempts, retryFailedChunks]);

    // Monitorar progresso da transcrição com detecção de chunks travados
    const startProgressMonitoring = useCallback((sessionId) => {
        progressIntervalRef.current = setInterval(async () => {
            try {
                const response = await api.get(`/audioSession/progress?sessionId=${sessionId}`);
                const progressData = response.data;
                
                setProgress(progressData);

                // Atualizar estados dos chunks baseado no progresso
                if (progressData.chunks) {
                    const now = Date.now();
                    setChunkStates(prev => {
                        const newStates = { ...prev };
                        progressData.chunks.forEach(chunk => {
                            const oldState = prev[chunk.id];
                            newStates[chunk.id] = chunk.status;
                            
                            // Se o status mudou, atualizar timestamp
                            if (oldState !== chunk.status) {
                                setLastProgressUpdate(prevUpdates => ({
                                    ...prevUpdates,
                                    [chunk.id]: now
                                }));
                            }
                        });
                        return newStates;
                    });
                }
                
                if (progressData.status === 'done') {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                    setCurrentStep(3); // Avançar para concatenação
                    await concatenateTranscriptions(sessionId);
                } else if (progressData.status === 'error' || progressData.errors?.length > 0) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                    throw new Error(progressData.errors?.[0] || 'Erro na transcrição');
                } else if (progressData.status === 'processing') {
                    // Verificar se há chunks travados e fazer retry se necessário
                    await checkAndRetryStuckChunks(sessionId, progressData);
                }
            } catch (error) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
                setError(`Erro no monitoramento: ${error.message}`);
                setIsProcessing(false);
            }
        }, PROGRESS_CHECK_INTERVAL);
    }, [checkAndRetryStuckChunks]);

    // Etapa 1: Upload do áudio
    const uploadAudio = useCallback(async (audioFile) => {
        try {
            setCurrentStep(0);
            const formData = new FormData();
            formData.append('audio', audioFile);

            const response = await api.post('/audioSession/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 300000 // 5 minutos para upload
            });            if (response.data.sessionId && response.data.filename) {
                setSessionId(response.data.sessionId);
                setCurrentStep(1);
                await splitAudio(response.data.sessionId, response.data.filename);
            } else {
                throw new Error('Resposta inválida do servidor');
            }
        } catch (error) {
            console.error('❌ Erro no upload:', error);
            
            let errorMessage = 'Erro no upload';
            if (error.response?.status === 500) {
                errorMessage = 'Erro 500 no upload - Verifique as configurações do servidor';
            } else if (error.response?.data?.error) {
                errorMessage = `Erro no upload: ${error.response.data.error}`;
            } else {
                errorMessage = `Erro no upload: ${error.message}`;
            }
            
            throw new Error(errorMessage);
        }
    }, []);// Etapa 2: Divisão do áudio em chunks
    const splitAudio = useCallback(async (sessionId, filename) => {
        try {
            setCurrentStep(1);
            console.log('🔪 Iniciando divisão do áudio:', { sessionId, filename });
            
            const response = await api.post('/audioSession/split', {
                sessionId,
                filename
            });

            console.log('✅ Resposta da divisão:', response.data);

            if (response.data.chunks && Array.isArray(response.data.chunks)) {
                setChunks(response.data.chunks);
                setCurrentStep(2);
                await transcribeAllChunks(sessionId);
            } else {
                throw new Error('Erro na divisão do áudio - resposta inválida');
            }
        } catch (error) {
            console.error('❌ Erro na divisão:', error);
            
            // Melhor tratamento de erro para debugging
            let errorMessage = 'Erro na divisão';
            if (error.response?.status === 500) {
                errorMessage = 'Erro 500 na divisão - Possível problema: FFmpeg não instalado no servidor';
                console.error('💡 Dica: Verifique se ffmpeg está instalado no backend');
            } else if (error.response?.data?.error) {
                errorMessage = `Erro na divisão: ${error.response.data.error}`;
            } else {
                errorMessage = `Erro na divisão: ${error.message}`;
            }
            
            throw new Error(errorMessage);
        }
    }, []);

    // Etapa 3: Transcrição de todos os chunks
    const transcribeAllChunks = useCallback(async (sessionId) => {
        try {
            setCurrentStep(2);
            const response = await api.post('/audioSession/transcribeAll', {
                sessionId
            });

            if (response.data.sessionId) {
                startProgressMonitoring(sessionId);
            } else {
                throw new Error('Erro ao iniciar transcrição');
            }
        } catch (error) {
            throw new Error(`Erro na transcrição: ${error.message}`);
        }
    }, [startProgressMonitoring]);

    // Etapa 4: Concatenação das transcrições
    const concatenateTranscriptions = useCallback(async (sessionId) => {
        try {
            setCurrentStep(3);
            const response = await api.post('/audioSession/concat', {
                sessionId
            });

            if (response.data.transcription) {
                // Verificar se há chunks perdidos
                const completeness = response.data.completeness;
                if (completeness && !completeness.isComplete) {
                    const lossPercentage = completeness.lossRate.toFixed(1);
                    const lostChunks = completeness.lostChunks;
                    
                    console.warn(`⚠️ Transcrição incompleta: ${lossPercentage}% do conteúdo foi perdido (${lostChunks} chunks)`);
                    
                    // Armazenar informações de perda para mostrar no frontend
                    const lossData = {
                        hasLoss: true,
                        lossRate: completeness.lossRate,
                        lostChunks: completeness.lostChunks,
                        totalChunks: completeness.totalChunks,
                        transcribedChunks: completeness.transcribedChunks,
                        isSignificant: completeness.hasSignificantLoss,
                        failedChunks: completeness.failedChunks || []
                    };
                    
                    setTranscriptionLoss(lossData);
                    
                    // Salvar no localStorage para persistir entre navegações
                    localStorage.setItem('transcriptionLoss', JSON.stringify(lossData));
                } else {
                    // Transcrição completa
                    const lossData = {
                        hasLoss: false,
                        lossRate: 0,
                        lostChunks: 0,
                        totalChunks: completeness?.totalChunks || 0,
                        transcribedChunks: completeness?.transcribedChunks || 0,
                        isSignificant: false,
                        failedChunks: []
                    };
                    
                    setTranscriptionLoss(lossData);
                    
                    // Salvar no localStorage
                    localStorage.setItem('transcriptionLoss', JSON.stringify(lossData));
                }
                
                setTranscription(response.data.transcription);
                setCurrentStep(4);
                await generateQuestions(response.data.transcription);
            } else {
                throw new Error('Erro na concatenação das transcrições');
            }
        } catch (error) {
            throw new Error(`Erro na concatenação: ${error.message}`);
        }
    }, []);

    // Etapa 5: Geração das questões
    const generateQuestions = useCallback(async (transcript) => {
        try {
            setCurrentStep(4);
            const response = await api.post('/audioSession/generateQuestions', {
                transcript,
                quant_topicos: 5, // Pode ser configurável
                quant_questoes: 3 // Questões por tópico, pode ser configurável
            });

            if (response.data.questions && response.data.questions.topicos) {
                // Converter formato do backend para o formato esperado pelo frontend
                const questionsData = {};
                response.data.questions.topicos.forEach(topico => {
                    questionsData[topico.nome_topico] = topico.questoes.map(questao => [
                        questao.pergunta,
                        questao.gabarito.toLowerCase() === 'verdadeiro' ? 'Verdadeiro' : 'Falso',
                        questao.explicacao
                    ]);
                });

                localStorage.setItem('generatedQuestions', JSON.stringify(questionsData));
                setQuestionsGenerated(true);
                setCurrentStep(5);
                setIsProcessing(false);

                DarkSwal.fire({
                    title: "Questões geradas com sucesso!",
                    text: `${Object.keys(questionsData).length} tópicos com questões foram criados.`,
                    icon: "success"
                });

                return questionsData;
            } else {
                throw new Error('Formato inválido da resposta de questões');
            }
        } catch (error) {
            throw new Error(`Erro na geração de questões: ${error.message}`);
        }
    }, []);

    // Função principal para processar o áudio
    const processAudio = useCallback(async (audioFile, quizName, quizDescription) => {
        if (!quizName || !quizDescription || !audioFile) {
            DarkSwal.fire({
                title: "Campos obrigatórios!",
                text: "Por favor, preencha o nome, descrição e faça o upload de um áudio.",
                icon: "warning"
            });
            return false;
        }

        // Validar formato do arquivo
        const validFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
        const fileExtension = audioFile.name.split('.').pop().toLowerCase();
        
        if (!validFormats.includes(fileExtension)) {
            DarkSwal.fire({
                title: "Formato inválido!",
                text: "Por favor, selecione um arquivo nos formatos: mp3, mp4, mpeg, mpga, m4a, wav, webm",
                icon: "warning"
            });
            return false;
        }

        // Validar tamanho do arquivo (100MB máximo)
        const maxSize = 200 * 1024 * 1024; // 100MB em bytes
        if (audioFile.size > maxSize) {
            DarkSwal.fire({
                title: "Arquivo muito grande!",
                text: "O arquivo deve ter no máximo 100MB.",
                icon: "warning"
            });
            return false;
        }

        setIsProcessing(true);
        setError(null);
        setCurrentStep(0);
        cleanup(); // Limpar intervalos anteriores

        try {
            await uploadAudio(audioFile);
            return true;
        } catch (error) {
            setError(error.message);
            setIsProcessing(false);
            cleanup();
            
            DarkSwal.fire({
                title: "Erro no processamento!",
                text: error.message,
                icon: "error"
            });
            return false;
        }
    }, [uploadAudio, cleanup]);

    // Função para obter o status atual
    const getCurrentStepInfo = useCallback(() => {
        return steps[currentStep] || steps[0];
    }, [currentStep]);

    // Função para calcular progresso geral
    const getOverallProgress = useCallback(() => {
        const stepProgress = currentStep / (steps.length - 1);
        
        // Se estiver na etapa de transcrição, incluir progresso detalhado
        if (currentStep === 2 && progress.total > 0) {
            const transcriptionProgress = progress.done / progress.total;
            return Math.min(((currentStep + transcriptionProgress) / (steps.length - 1)) * 100, 100);
        }
        
        return stepProgress * 100;
    }, [currentStep, progress, steps.length]);    return {
        // Estados
        isProcessing,
        currentStep,
        sessionId,
        chunks,
        transcription,
        progress,
        error,
        questionsGenerated,
        steps,
        chunkStates,
        retryAttempts,
        
        // Funções
        processAudio,
        resetState,
        cleanup,
        getCurrentStepInfo,
        getOverallProgress,
        retryFailedChunks,
        
        // Informações sobre chunks perdidos
        transcriptionLoss,
        
        // Utilitários
        isComplete: questionsGenerated && !isProcessing,
        hasError: !!error,
        hasStuckChunks: Object.values(chunkStates).some(state => state === 'processing') && 
                        Object.keys(lastProgressUpdate).some(chunkId => 
                            Date.now() - (lastProgressUpdate[chunkId] || 0) > CHUNK_TIMEOUT),
        hasSignificantLoss: transcriptionLoss.isSignificant
    };
};

export default useAudioProcessing;
