import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import QuizIcon from '@mui/icons-material/Quiz';
import ClassIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout'; 

import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Quizzes from '../pages/Quizzes';
import Classes from '../pages/Classes';
import NewQuiz from '../pages/NewQuiz';
import VoiceQuiz from '../pages/VoiceQuiz';
import VoiceQuizSelection from '../pages/VoiceQuizSelection';
import NewClass from '../pages/NewClass';
import QuizApply from '../pages/QuizApply';
import QuizDetails from '../pages/QuizDetails';
import ClassDetails from '../pages/ClassDetails';
import QuizEdit from '../pages/QuizEdit';

import logo from '../assets/logo.png';
import DarkSwal from '../components/DarkSwal'; 

let drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const location = useLocation();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const isQuizScreen = location.pathname === '/quiz';
  drawerWidth = isQuizScreen ? 0 : 240;

  React.useEffect(() => {
    if (location.pathname === '/quiz') {
      setOpen(false);
    }
  }, [location]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open} sx={{ py: 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
            disabled={isQuizScreen}
          >
            <MenuIcon />
          </IconButton>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Logo" />
            <Typography variant="h6" noWrap component="div">
              EngajaEdu
            </Typography>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader sx={{ py: 2.45 }}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/quizzes">
              <ListItemIcon>
                <QuizIcon />
              </ListItemIcon>
              <ListItemText primary="Questionários" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/classes">
              <ListItemIcon>
                <ClassIcon />
              </ListItemIcon>
              <ListItemText primary="Turmas" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                DarkSwal.fire({
                  title: 'Sair do sistema?',
                  text: 'Tem certeza que deseja encerrar a sessão?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Sim, sair',
                  cancelButtonText: 'Cancelar',
                  confirmButtonColor: '#d33',
                }).then((result) => {
                  if (result.isConfirmed) {
                    localStorage.removeItem('usuarioLogado');
                    window.location.reload();
                  }
                });
              }}
            >
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />        <Routes>
          <Route path="/" element={<Navigate to="/quizzes" />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/quizzes/new" element={<NewQuiz />} />
          <Route path="/quizzes/voice" element={<VoiceQuiz />} />
          <Route path="/quizzes/voice/select" element={<VoiceQuizSelection />} />
          <Route path="/classes/new" element={<NewClass />} />

          <Route path="/quiz" element={<QuizApply />} />
          <Route path="/quizzes/:quizCode" element={<QuizDetails />} />
          <Route path="/classes/:classCode" element={<ClassDetails />} />
          <Route path="/quizzes/:quizCode/edit" element={<QuizEdit />} />
        </Routes>
      </Main>
    </Box>
  );
}
