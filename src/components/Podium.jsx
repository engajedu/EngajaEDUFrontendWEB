import React from 'react';
import { Box, Grid, Typography, Badge, Container, Divider } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import getFirstNames from '../utils/getFirstNames';

const Podium = ({ students }) => {
  const podiumStudents = students.slice(0, 3);

  const setMedalColor = (index) => {
    if (index === 0) {
      return '#a57c00';
    } else if (index === 1) {
      return '#c0c0c0';
    } else if (index === 2) {
      return '#cd7f32';
    }
  };

  const renderPodiumItem = ({ item, index }) => {
    const positionColor = setMedalColor(index);

    return (
      <Grid key={item.matricula}>
        <Box sx={{ display: "flex", gap: 10, p: 3 }}>

          <Box sx={{ mt: 2 }}>
            <EmojiEvents sx={{ color: positionColor }} fontSize='large' />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 15,
              alignItems: "flex-end"
            }}
          >
            <Box>
              <Typography
              variant='h6'
              sx={{
                color: '#aaa'
              }}
              >
                {index + 1}º Lugar
              </Typography>

              <Typography
                noWrap
                variant="h5"
              >
                {getFirstNames(item.nome)}
              </Typography>
            </Box>

            <Box>
              {
                item.pontuacao == 0 &&
                <Typography variant="h5">Nenhum acerto</Typography>
              }

              {
                item.pontuacao == 1 &&
                <Typography variant="h5">1 acerto</Typography>
              }

              {
                item.pontuacao > 1 &&
                <Typography variant="h5">{item.pontuacao} acertos</Typography>

              }

            </Box>
          </Box>
        </Box>

        <Divider sx={{ mx: 'auto'}} />
      </Grid>
    )
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >

      <Box
        alignItems="baseline"
        p={2}
      >
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h4">Pódio</Typography>
        </Box>

        <Grid  direction="column" my={1}>
          {podiumStudents.map((item, index) => renderPodiumItem({ item, index }))}
        </Grid>

      </Box>
    </Box>
  );
};

export default Podium;