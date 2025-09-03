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

const useClasses = () => {
  const savedUser = useMemo(() => getSavedUser(), []);
  const [usuario, setUsuario] = useState(savedUser?.usuario || null);

  const [classes, setClasses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchData = async (usuarioOverride) => {
    const userParam = (usuarioOverride ?? usuario) || null;

    setLoading(true);
    setError(null);

    try {
      if (!userParam) {
        throw new Error('Professor não identificado (sem usuário). Faça login novamente.');
      }

      // 👉 manda o usuário para o backend
      const result = await api.get('/getTurmas', { params: { usuario: userParam } });

      setClasses(result.data);
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
      setError({
        message: err?.response?.data?.error || err.message || 'Erro ao buscar turmas',
        status: err?.response?.status
      });
      setClasses(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  return { classes, loading, error, refetch: fetchData, professorUsuario: usuario, setProfessorUsuario: setUsuario };
};

export default useClasses;