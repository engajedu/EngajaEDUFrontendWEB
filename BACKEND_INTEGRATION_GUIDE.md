# 🎯 Guia de Integração Backend - Questionários por Áudio

## 📋 Resumo do Fluxo

```
1. UPLOAD DE ÁUDIO → 2. TRANSCRIÇÃO + IA → 3. SELEÇÃO DE QUESTÕES → 4. SALVAMENTO
```

### Processo Completo:
1. **Professor faz upload de áudio** (mp3, mp4, mpeg, mpga, m4a, wav, webm)
2. **Backend transcreve áudio e gera questões V/F organizadas por tópicos**
3. **Professor seleciona questões desejadas via checkboxes**
4. **Sistema salva questionário final** (usando rota existente)

---

## 🔧 Integrações Backend Necessárias

### 📡 **INTEGRAÇÃO #1: Processamento de Áudio**

#### **Rota Nova Necessária:**
```
POST /processAudio
ou
POST /transcribeAudio
```

#### **Payload de Entrada:**
```javascript
// FormData
{
  audio: File, // Arquivo de áudio
  quizName: String, // Nome do questionário (opcional, para contexto)
  quizDescription: String // Descrição (opcional, para contexto)
}
```

#### **Processo Backend:**
1. **Receber arquivo de áudio** nos formatos: mp3, mp4, mpeg, mpga, m4a, wav, webm
2. **Transcrever áudio** usando:
   - OpenAI Whisper
   - Google Speech-to-Text
   - Azure Speech Services
   - Ou similar
3. **Processar transcrição com IA** (GPT, Claude, etc) para:
   - Identificar tópicos principais
   - Gerar questões Verdadeiro/Falso
   - Organizar por temas
4. **Retornar JSON estruturado**

#### **Resposta Esperada:**
```json
{
  "success": true,
  "message": "Áudio processado com sucesso",
  "questions": {
    "Tópico 1": [
      ["Pergunta 1", "Verdadeiro"],
      ["Pergunta 2", "Falso"],
      ["Pergunta 3", "Verdadeiro"]
    ],
    "Tópico 2": [
      ["Pergunta 4", "Falso"],
      ["Pergunta 5", "Verdadeiro"]
    ],
    "Tópico N": [
      ["Pergunta X", "Verdadeiro"]
    ]
  },
  "metadata": {
    "duration": "5:30", // Duração do áudio
    "transcriptionLength": 1500, // Caracteres da transcrição
    "questionsGenerated": 15, // Total de questões
    "topicsFound": 3 // Total de tópicos
  }
}
```

#### **Tratamento de Erros:**
```json
{
  "success": false,
  "error": "Erro específico",
  "message": "Mensagem amigável para o usuário"
}
```

#### **Considerações Técnicas:**
- **Timeout**: Configurar timeout alto (5+ minutos)
- **Upload**: Suporte a arquivos até 100MB
- **Processamento**: Tempo variável conforme tamanho do áudio
- **Rate Limiting**: Considerar limitação por usuário
- **Progresso**: Opcionalmente implementar WebSocket para feedback em tempo real

---

### 📡 **INTEGRAÇÃO #2: Passagem de Dados (FRONTEND)**

#### **Código para VoiceQuiz.jsx:**
```javascript
// Substituir simulação por:
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('quizName', quizName);
formData.append('quizDescription', quizDescription);

const response = await api.post('/processAudio', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  timeout: 300000 // 5 minutos
});

// Salvar questões para próxima tela
const questionsData = response.data.questions;
localStorage.setItem('generatedQuestions', JSON.stringify(questionsData));
```

#### **Código para VoiceQuizSelection.jsx:**
```javascript
// Usar questões reais ao invés de mockadas:
const { questionsData: realQuestionsData } = location.state || {};
const generatedQuestions = realQuestionsData || JSON.parse(localStorage.getItem('generatedQuestions') || '{}');
```

---

### 📡 **INTEGRAÇÃO #3: Salvamento Final (JÁ IMPLEMENTADO)**

#### **Rota Existente:**
```
POST /cadastraQuestionario
```

#### **Payload (JÁ FUNCIONAL):**
```json
{
  "questionario": {
    "nome": "Nome do questionário",
    "descricao": "Descrição do questionário",
    "questoes": [
      {
        "enunciado": "Pergunta...",
        "resposta": "V", // ou "F"
        "tema": "Tópico da questão"
      }
    ]
  }
}
```

**✅ Esta parte NÃO precisa de alteração no backend**

---

## 🛠️ Ferramentas Sugeridas para Backend

### **Transcrição de Áudio:**
- **OpenAI Whisper API** (Recomendado)
- Google Cloud Speech-to-Text
- Azure Cognitive Services Speech
- AssemblyAI

### **Processamento de IA:**
- **OpenAI GPT-4** (Recomendado)
- Anthropic Claude
- Google Gemini
- Azure OpenAI

### **Prompt Sugerido para IA:**
```
Analise esta transcrição de aula e:

1. Identifique os tópicos principais abordados
2. Para cada tópico, crie 3-5 questões de Verdadeiro/Falso
3. As questões devem testar compreensão conceitual
4. Retorne no formato JSON:

{
  "Tópico 1": [
    ["Pergunta 1", "Verdadeiro"],
    ["Pergunta 2", "Falso"]
  ]
}

Transcrição: [TEXTO_TRANSCRITO]
```

---

## 🚀 Implementação Recomendada

### **Fase 1: MVP**
1. Implementar rota `/processAudio`
2. Integração básica com Whisper + GPT
3. Retorno simples com questões organizadas

### **Fase 2: Melhorias**
1. WebSocket para progresso em tempo real
2. Cache de transcrições
3. Otimização de prompts de IA
4. Validação avançada de arquivos

### **Fase 3: Avançado**
1. Múltiplos idiomas
2. Diferentes tipos de questões
3. IA personalizada por área de conhecimento
4. Analytics de uso

---

## 📊 Arquivos Modificados

### **Frontend (PRONTO):**
- ✅ `VoiceQuiz.jsx` - Upload e processamento
- ✅ `VoiceQuizSelection.jsx` - Seleção de questões
- ✅ `PersistentDrawerLeft.jsx` - Rotas
- ✅ `Quizzes.jsx` - Botão de acesso

### **Backend (IMPLEMENTADO):**
- ✅ Nova rota `/processAudio` (IMPLEMENTADA)
- ✅ Serviço de transcrição (IMPLEMENTADO)
- ✅ Serviço de geração de questões (IMPLEMENTADO)
- ✅ Validação de formatos de arquivo (IMPLEMENTADO)
- ✅ Rota `/cadastraQuestionario` (já existia)

---

## 🧪 Como Testar Após Implementação

1. **Fazer upload** de arquivo de áudio pequeno (30s-2min)
2. **Aguardar processamento** (botão fica cinza)
3. **Verificar questões geradas** na tela de seleção
4. **Selecionar algumas questões** via checkbox
5. **Salvar questionário** e verificar na listagem

---

## ⚠️ Observações Importantes

- **Custos de IA**: Whisper + GPT podem gerar custos significativos
- **Tempo de processamento**: Varia conforme tamanho do áudio
- **Qualidade**: Depende da clareza do áudio original
- **Validação**: Implementar validação robusta de tipos de arquivo
- **Segurança**: Validar e sanitizar uploads
- **Limitações**: Considerar limite de tamanho e duração

---

## 🆘 Suporte

Para dúvidas sobre a implementação frontend ou ajustes necessários, consulte:
- Arquivos comentados em `src/pages/VoiceQuiz.jsx`
- Arquivos comentados em `src/pages/VoiceQuizSelection.jsx`
- Este documento

**Status**: ✅ Frontend implementado | ✅ Backend implementado | 🚀 PRONTO PARA USO
