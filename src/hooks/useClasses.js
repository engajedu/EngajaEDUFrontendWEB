import { useState, useEffect } from 'react';
import api from '../services/api';

const useClasses = () => {
    const [classes, setClasses] = useState(null);

    const fetchData = async () => {
      try {
        const result = await api.get('/getTurmas');
        setClasses(result.data);
      } catch (error) {
        console.error('Erro ao buscar turmas:', error);
      }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return { classes, refetch: fetchData };
}

export default useClasses;