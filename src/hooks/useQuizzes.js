import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const getSavedUser = () => {
  try {
    const raw = localStorage.getItem('auth:user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const useQuizzes = () => {
  const savedUser = useMemo(() => getSavedUser(), []);
  const [usuario, setUsuario] = useState(savedUser?.usuario || null);

  const [quizzes, setQuizzes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchData = async (usuarioOverride) => {
    const userParam = (usuarioOverride ?? usuario) || null;

    console.log('🔄 Iniciando busca de questionários...', { usuario: userParam });
    setLoading(true);
    setError(null);

    try {
      if (!userParam) {
        throw new Error('Professor não identificado (sem usuário). Faça login novamente.');
      }

      console.log('📡 GET /Questionarios com filtro de usuario...');
      const result = await api.get('/Questionarios', {
        params: { usuario: userParam }, // << envia o usuario pro backend
      });

      console.log('✅ Questionários carregados com sucesso:', {
        count: result.data?.length || 0,
      });

      setQuizzes(result.data);
      setError(null);
    } catch (error) {
      console.error('❌ Erro ao carregar questionários:', error);

      let errorMessage = 'Erro desconhecido ao carregar questionários';
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e se o servidor está online.';
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Timeout na conexão. O servidor demorou muito para responder.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Rota de questionários não encontrada no servidor.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor ao buscar questionários.';
      } else if (error.response?.status) {
        errorMessage = `Erro do servidor: ${error.response.status} - ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError({
        message: errorMessage,
        originalError: error.message,
        code: error.code,
        status: error.response?.status
      });

      setQuizzes(null);
    } finally {
      setLoading(false);
      console.log('🏁 Busca de questionários finalizada');
    }
  };

  // Busca um quiz já carregado por id (corrigido)
  const fetchQuizById = async (id) => {
    try {
      const found = quizzes?.find((q) => q.idQuestao === id || q.id === id);
      return found ?? null;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }
  };

  // (opcional) cria novo quiz já atribuindo ao professor pelo usuario
  const createNewQuiz = async (newQuiz) => {
    try {
      if (!usuario) throw new Error('Professor não identificado (sem usuário).');

      const payload = { ...newQuiz, professorUsuario: usuario }; // remova se não usar no backend
      const result = await api.post('/quizzes', payload);

      setQuizzes((prev) => (prev ? [...prev, result.data] : [result.data]));
      return result.data;
    } catch (error) {
      console.error('Error adding quiz:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🚀 useQuizzes: montado. usuario:', usuario);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  return {
    quizzes,
    loading,
    error,
    refetch: fetchData,     // pode chamar refetch('Andre') por exemplo
    fetchQuizById,
    createNewQuiz,
    professorUsuario: usuario,
    setProfessorUsuario: setUsuario,
  };
};

export default useQuizzes;
