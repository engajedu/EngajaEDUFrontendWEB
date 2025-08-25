// Mock service para simular o backend durante desenvolvimento
// Este arquivo pode ser usado para testar a interface antes do backend estar pronto

import DarkSwal from '../components/DarkSwal';

class MockAudioService {
    constructor() {
        this.sessions = new Map();
        this.currentSessionId = 1;
    }

    // Simular upload de áudio
    async uploadAudio(audioFile) {
        await this.delay(2000); // Simular tempo de upload
        
        const sessionId = `session_${this.currentSessionId++}`;
        const filename = audioFile.name;
        
        this.sessions.set(sessionId, {
            filename,
            chunks: [],
            transcriptions: [],
            status: 'uploaded'
        });

        return {
            sessionId,
            filename
        };
    }

    // Simular divisão em chunks
    async splitAudio(sessionId, filename) {
        await this.delay(1500);
        
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Sessão não encontrada');

        const chunks = [
            `chunk_1_${sessionId}.mp3`,
            `chunk_2_${sessionId}.mp3`,
            `chunk_3_${sessionId}.mp3`,
            `chunk_4_${sessionId}.mp3`
        ];

        session.chunks = chunks;
        session.status = 'split';

        return { chunks };
    }

    // Simular início da transcrição
    async startTranscription(sessionId) {
        await this.delay(1000);
        
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Sessão não encontrada');

        session.status = 'transcribing';
        session.progress = { total: session.chunks.length, done: 0 };

        // Simular progresso gradual
        setTimeout(() => this.simulateTranscriptionProgress(sessionId), 2000);

        return {
            message: 'Transcrição iniciada',
            sessionId
        };
    }

    // Simular progresso da transcrição
    simulateTranscriptionProgress(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || session.status !== 'transcribing') return;

        session.progress.done++;

        if (session.progress.done < session.progress.total) {
            // Continuar progresso
            setTimeout(() => this.simulateTranscriptionProgress(sessionId), 3000);
        } else {
            // Transcrição completa
            session.status = 'done';
        }
    }

    // Verificar progresso
    async getProgress(sessionId) {
        await this.delay(500);
        
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Sessão não encontrada');

        return {
            total: session.progress?.total || 0,
            done: session.progress?.done || 0,
            status: session.status,
            errors: [],
            current: session.status === 'transcribing' ? `chunk_${session.progress?.done || 0}` : ''
        };
    }

    // Simular concatenação
    async concatenateTranscriptions(sessionId) {
        await this.delay(2000);
        
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Sessão não encontrada');

        const transcription = `Esta é uma transcrição simulada do áudio enviado. 
        O conteúdo aborda diversos tópicos importantes como matemática, ciências e história.
        Durante a aula foram explicados conceitos fundamentais que serão úteis para os estudantes.
        É importante que os alunos prestem atenção aos detalhes e façam anotações.
        Os exercícios práticos ajudam a fixar o conteúdo aprendido.
        A avaliação será baseada no material apresentado hoje.`;

        session.transcription = transcription;
        session.status = 'concatenated';

        return { transcription };
    }

    // Simular geração de questões
    async generateQuestions(transcript, quantTopicos = 3, quantQuestoes = 3) {
        await this.delay(3000);

        const mockQuestions = {
            questions: {
                topicos: [
                    {
                        nome_topico: "Matemática",
                        questoes: [
                            {
                                pergunta: "A matemática é uma ciência exata que estuda números e formas",
                                gabarito: "V",
                                explicacao: "A matemática é considerada uma ciência exata"
                            },
                            {
                                pergunta: "Todas as operações matemáticas são irreversíveis",
                                gabarito: "F",
                                explicacao: "Muitas operações matemáticas são reversíveis"
                            },
                            {
                                pergunta: "O zero é um número natural",
                                gabarito: "F",
                                explicacao: "O zero não é considerado um número natural na definição clássica"
                            }
                        ]
                    },
                    {
                        nome_topico: "Ciências",
                        questoes: [
                            {
                                pergunta: "A fotossíntese é um processo realizado pelas plantas",
                                gabarito: "V",
                                explicacao: "A fotossíntese é o processo pelo qual as plantas produzem energia"
                            },
                            {
                                pergunta: "A água ferve a 90 graus Celsius ao nível do mar",
                                gabarito: "F",
                                explicacao: "A água ferve a 100 graus Celsius ao nível do mar"
                            }
                        ]
                    },
                    {
                        nome_topico: "História",
                        questoes: [
                            {
                                pergunta: "O Brasil foi descoberto em 1500",
                                gabarito: "V",
                                explicacao: "Pedro Álvares Cabral chegou ao Brasil em 1500"
                            },
                            {
                                pergunta: "A Segunda Guerra Mundial começou em 1945",
                                gabarito: "F",
                                explicacao: "A Segunda Guerra Mundial começou em 1939"
                            }
                        ]
                    }
                ]
            }
        };

        return mockQuestions;
    }

    // Função utilitária para delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Criar instância do mock service
const mockAudioService = new MockAudioService();

// Função para ativar o modo mock (comentar/descomentar conforme necessário)
export const enableMockMode = () => {
    console.log('🧪 MODO MOCK ATIVADO - Simulando backend de áudio');
    
    DarkSwal.fire({
        title: "Modo de Teste Ativado",
        text: "O backend está sendo simulado para testes da interface",
        icon: "info",
        timer: 3000
    });

    return mockAudioService;
};

// Descomente a linha abaixo para ativar o modo mock durante desenvolvimento
// window.mockAudioService = enableMockMode();

export default mockAudioService;
