import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PersistentDrawerLeft from './components/PersistentDrawerLeft';
import Login from './components/Login';
import { QuizClassProvider } from './contexts/QuizClassContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  const [logado, setLogado] = useState(() => {
    return localStorage.getItem('usuarioLogado') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('usuarioLogado', logado ? 'true' : 'false');
  }, [logado]);

  return (
    <DndProvider backend={HTML5Backend}>
      <QuizClassProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          {logado ? (
            <PersistentDrawerLeft />
          ) : (
            <Login onLogin={() => setLogado(true)} />
          )}
        </ThemeProvider>
      </QuizClassProvider>
    </DndProvider>
  );
}
