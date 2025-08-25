import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DarkSwal from '../components/DarkSwal';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (usuario === 'testDev' && senha === '123@Aa') {
      onLogin({ usuario: 'testDev', nome: 'Desenvolvedor Teste' });
    } else {
      DarkSwal.fire({
        title: 'Senha incorreta',
        text: 'Verifique seu usuário e senha',
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 5 }}>
        {/* Logo personalizada */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img src="/lampada.png" alt="Logo" style={{ height: 80, marginBottom: 8 }} />
        </Box>

        {/* Ícone de cadeado */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <LockOutlinedIcon sx={{ fontSize: 40, color: '#3f51b5' }} />
        </Box>

        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="Usuário"
            fullWidth
            margin="normal"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          <TextField
            label="Senha"
            type={mostrarSenha ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setMostrarSenha(!mostrarSenha)} edge="end">
                    {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Box textAlign="center" mt={3}>
            <Button type="submit" variant="contained">
              Entrar
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
