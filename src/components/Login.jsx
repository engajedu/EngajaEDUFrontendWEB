import { useEffect, useState } from 'react';
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

// 👉 Cadastre aqui os usuários/professores
const professores = [
  { id: 'p001', usuario: 'testDev', senha: '123@Aa',  nome: 'Desenvolvedor Teste',          email: '',                          role: 'PROFESSOR' },
  { id: 'p002', usuario: 'André',   senha: '1234567', nome: 'Prof. Andre',                  email: 'andre.soares@ufpi.edu.br',  role: 'PROFESSOR' },
];

// Normaliza para comparar: remove acentos, ignora maiúsculas/minúsculas e espaços
const norm = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Reidrata usuário salvo (opcional, mas útil)
  useEffect(() => {
    const raw = localStorage.getItem('auth:user');
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        onLogin?.(saved);
      } catch {
        localStorage.removeItem('auth:user');
      }
    }
  }, [onLogin]);

  const handleLogin = (e) => {
    e.preventDefault();

    // Procura no array por credenciais válidas usando usuario normalizado
    const prof = professores.find(
      (p) => norm(p.usuario) === norm(usuario) && p.senha === senha
    );

    if (prof) {
      // Nunca salve a senha
      const loggedUser = {
        id: prof.id,
        usuario: prof.usuario, // 👈 será usado para buscar no backend (?usuario=...)
        nome: prof.nome,
        email: prof.email || null, // opcional, se quiser ter também
        role: prof.role,
      };

      // 💾 Guarda para uso futuro (ex.: filtrar questionários do professor via usuario)
      localStorage.setItem('auth:user', JSON.stringify(loggedUser));

      // Notifica o app
      onLogin?.(loggedUser);

      // (opcional) limpa campos
      setUsuario('');
      setSenha('');
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
