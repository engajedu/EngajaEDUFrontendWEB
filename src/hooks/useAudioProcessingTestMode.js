/**
 * 🧪 MODO DE TESTE PARA DESENVOLVIMENTO LOCAL
 * 
 * Este arquivo permite testar a interface de áudio sem depender do backend estar 100% funcional.
 * Pode ser usado quando o backend retorna erro 500 ou não está completamente implementado.
 */

import { useState, useRef, useCallback } from 'react';
import DarkSwal from '../components/DarkSwal';

const useAudioProcessingTestMode = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [chunks, setChunks] = useState([]);
    const [transcription, setTranscription] = useState('');
    const [progress, setProgress] = useState({ total: 0, done: 0, status: 'idle' });
    const [error, setError] = useState(null);
    const [questionsGenerated, setQuestionsGenerated] = useState(false);
    
    const progressIntervalRef = useRef(null);

    const steps = [
        { label: 'Upload do áudio', description: 'Enviando arquivo para o servidor...' },
        { label: 'Divisão em chunks', description: 'Dividindo áudio em segmentos...' },
        { label: 'Transcrição', description: 'Transcrevendo áudio com IA...' },
        { label: 'Concatenação', description: 'Concatenando transcrições...' },
        { label: 'Geração de questões', description: 'Gerando questões...' },
        { label: 'Finalizado', description: 'Processo concluído!' }
    ];

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
    }, [cleanup]);

    // Função para simular delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Simular progresso step by step
    const simulateProgress = useCallback(async () => {
        const stepDelays = [2000, 1500, 8000, 2000, 3000]; // Delays para cada etapa
        
        for (let step = 0; step < stepDelays.length; step++) {
            setCurrentStep(step);
            
            // Simular progresso específico para transcrição
            if (step === 2) {
                setProgress({ total: 4, done: 0, status: 'processing' });
                
                // Simular progresso gradual da transcrição
                for (let chunk = 0; chunk < 4; chunk++) {
                    await delay(2000);
                    setProgress(prev => ({ ...prev, done: chunk + 1 }));
                }
            }
            
            await delay(stepDelays[step]);
        }
        
        // Finalizar processo
        setCurrentStep(5);
        setTranscription('Esta é uma transcrição simulada para teste. O conteúdo aborda matemática, ciências e história com diversos conceitos importantes para a educação.');
        
        // Gerar questões mocadas
        const mockQuestions = {
            "Matemática": [
                ["A matemática é uma ciência exata que estuda números e formas", "Verdadeiro"],
                ["Todas as operações matemáticas são irreversíveis", "Falso"],
                ["O zero é um número natural", "Falso"]
            ],
            "Ciências": [
                ["A fotossíntese é um processo realizado pelas plantas", "Verdadeiro"],
                ["A água ferve a 90 graus Celsius ao nível do mar", "Falso"],
                ["Os seres vivos são compostos por células", "Verdadeiro"]
            ],
            "História": [
                ["O Brasil foi descoberto em 1500", "Verdadeiro"],
                ["A Segunda Guerra Mundial começou em 1945", "Falso"],
                ["Dom Pedro I proclamou a independência do Brasil", "Verdadeiro"]
            ]
        };

        localStorage.setItem('generatedQuestions', JSON.stringify(mockQuestions));
        setQuestionsGenerated(true);
        setIsProcessing(false);

        DarkSwal.fire({
            title: "🧪 Teste Concluído!",
            text: "Questões mockadas geradas com sucesso para teste da interface.",
            icon: "success"
        });

    }, []);

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
        const maxSize = 100 * 1024 * 1024;
        if (audioFile.size > maxSize) {
            DarkSwal.fire({
                title: "Arquivo muito grande!",
                text: "O arquivo deve ter no máximo 100MB.",
                icon: "warning"
            });
            return false;
        }

        // Mostrar aviso de modo teste
        const result = await DarkSwal.fire({
            title: "🧪 Modo de Teste Ativado",
            text: "O backend está com problemas. Deseja continuar com dados simulados para testar a interface?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sim, testar interface",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) {
            return false;
        }

        setIsProcessing(true);
        setError(null);
        setCurrentStep(0);
        setSessionId('test-session-' + Date.now());
        cleanup();

        try {
            await simulateProgress();
            return true;
        } catch (error) {
            setError('Erro no modo de teste: ' + error.message);
            setIsProcessing(false);
            cleanup();
            
            DarkSwal.fire({
                title: "Erro no teste!",
                text: error.message,
                icon: "error"
            });
            return false;
        }
    }, [simulateProgress, cleanup]);

    const getCurrentStepInfo = useCallback(() => {
        return steps[currentStep] || steps[0];
    }, [currentStep]);

    const getOverallProgress = useCallback(() => {
        const stepProgress = currentStep / (steps.length - 1);
        
        if (currentStep === 2 && progress.total > 0) {
            const transcriptionProgress = progress.done / progress.total;
            return Math.min(((currentStep + transcriptionProgress) / (steps.length - 1)) * 100, 100);
        }
        
        return stepProgress * 100;
    }, [currentStep, progress, steps.length]);

    return {
        isProcessing,
        currentStep,
        sessionId,
        chunks,
        transcription,
        progress,
        error,
        questionsGenerated,
        steps,
        processAudio,
        resetState,
        cleanup,
        getCurrentStepInfo,
        getOverallProgress,
        isComplete: questionsGenerated && !isProcessing,
        hasError: !!error
    };
};

export default useAudioProcessingTestMode;
