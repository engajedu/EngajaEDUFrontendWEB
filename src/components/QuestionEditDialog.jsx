import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    Typography
} from "@mui/material";
import { Edit, Save, Cancel } from '@mui/icons-material';

export default function QuestionEditDialog({ 
    open, 
    onClose, 
    question, 
    onSave,
    topicName 
}) {
    const [editedQuestion, setEditedQuestion] = useState("");
    const [editedAnswer, setEditedAnswer] = useState("Verdadeiro");

    // Atualizar valores quando o diálogo é aberto com nova questão
    useEffect(() => {
        if (open && question) {
            setEditedQuestion(question[0] || "");
            setEditedAnswer(question[1] || "Verdadeiro");
        }
    }, [open, question]);

    const handleSave = () => {
        if (editedQuestion.trim() === "") {
            return;
        }
        onSave([editedQuestion, editedAnswer]);
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Edit />
                    <Typography variant="h6">
                        Editar Questão - {topicName}
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <TextField
                        label="Enunciado da Questão"
                        multiline
                        rows={4}
                        value={editedQuestion}
                        onChange={(e) => setEditedQuestion(e.target.value)}
                        variant="outlined"
                        fullWidth
                        required
                        helperText="Digite o enunciado da questão"
                    />
                    
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Gabarito</FormLabel>
                        <RadioGroup
                            value={editedAnswer}
                            onChange={(e) => setEditedAnswer(e.target.value)}
                            row
                        >
                            <FormControlLabel 
                                value="Verdadeiro" 
                                control={<Radio color="success" />} 
                                label="Verdadeiro" 
                            />
                            <FormControlLabel 
                                value="Falso" 
                                control={<Radio color="error" />} 
                                label="Falso" 
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
                <Button 
                    onClick={handleClose}
                    startIcon={<Cancel />}
                    variant="outlined"
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSave}
                    startIcon={<Save />}
                    variant="contained"
                    disabled={editedQuestion.trim() === ""}
                    sx={{ 
                        backgroundColor: '#4caf50', 
                        '&:hover': { backgroundColor: '#45a049' }
                    }}
                >
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
