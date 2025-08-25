import React, { useState } from 'react';
import { Box, TextField, Button, Radio, RadioGroup, FormControlLabel, Typography } from '@mui/material';

export default function NewQuestion({ goBack }) {
    const [statement, setStatement] = useState('');
    const [topic, setTopic] = useState('');
    const [answer, setAnswer] = useState('true');

    const handleSave = () => {
        console.log({
            statement,
            topic,
            answer,
        });
        goBack();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                bgcolor: 'background.default',
                color: 'text.primary',
                padding: 4,
            }}
        >
            <Typography variant="h4" gutterBottom>
                Nova Questão
            </Typography>
            <TextField
                label="Enunciado da questão"
                variant="outlined"
                fullWidth
                margin="normal"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
            />
            <TextField
                label="Assunto da questão"
                variant="outlined"
                fullWidth
                margin="normal"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
            />
            <RadioGroup
                row
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                sx={{ marginTop: 2 }}
            >
                <FormControlLabel value="true" control={<Radio />} label="Verdadeiro" />
                <FormControlLabel value="false" control={<Radio />} label="Falso" />
            </RadioGroup>
            <Box sx={{ marginTop: 4, display: 'flex', gap: 2 }}>
                <Button variant="outlined" color="error" onClick={goBack}>
                    Cancelar
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Salvar Questão
                </Button>
            </Box>
        </Box>
    );
}
