import { useRef, useState } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Box, 
    Container, 
    IconButton, 
    TextField,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import { Close, Edit, Save, Cancel } from '@mui/icons-material';
import { useDrag, useDrop } from 'react-dnd';

export default function EditableQuestionCard({ 
    index, 
    question, 
    subject, 
    answer, 
    hasDelete = false, 
    onRemove = null, 
    onEdit = null,
    moveCard 
}) {
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuestion, setEditedQuestion] = useState(question);
    const [editedAnswer, setEditedAnswer] = useState(answer === 'V' ? 'Verdadeiro' : 'Falso');
    const [editedSubject, setEditedSubject] = useState(subject);
    
    const ref = useRef(null);
    const ItemTypes = { QUESTION: 'question' };

    const [{ handlerId }, drop] = useDrop({
        accept: ItemTypes.QUESTION,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item, monitor) {
            if (!ref.current) {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index
            if (dragIndex === hoverIndex) {
                return
            }
            const hoverBoundingRect = ref.current?.getBoundingClientRect()
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            const clientOffset = monitor.getClientOffset()
            const hoverClientY = clientOffset.y - hoverBoundingRect.top
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
            moveCard(dragIndex, hoverIndex)
            item.index = hoverIndex
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.QUESTION,
        item: () => {
            return { index }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    const handleEdit = () => {
        setIsEditing(true);
        setEditedQuestion(question);
        setEditedAnswer(answer === 'V' ? 'Verdadeiro' : 'Falso');
        setEditedSubject(subject);
    };

    const handleSave = () => {
        if (editedQuestion.trim() === '' || editedSubject.trim() === '') {
            return;
        }
        
        if (onEdit) {
            onEdit({
                enunciado: editedQuestion,
                resposta: editedAnswer === 'Verdadeiro' ? 'V' : 'F',
                tema: editedSubject
            }, index);
        }
        
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedQuestion(question);
        setEditedAnswer(answer === 'V' ? 'Verdadeiro' : 'Falso');
        setEditedSubject(subject);
        setIsEditing(false);
    };

    return (
        <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
            <Grid item xs={12}>
                <Card sx={{ 
                    mb: 4, 
                    height: '100%', 
                    transition: 'transform 0.2s ease, background-color 0.2s ease',
                    bgcolor: isEditing ? 'action.hover' : 'background.paper'
                }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
                        <Container sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            {isEditing ? (
                                // Modo de edição
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="Assunto/Tema"
                                        value={editedSubject}
                                        onChange={(e) => setEditedSubject(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                    
                                    <TextField
                                        label="Enunciado da Questão"
                                        multiline
                                        rows={3}
                                        value={editedQuestion}
                                        onChange={(e) => setEditedQuestion(e.target.value)}
                                        variant="outlined"
                                        fullWidth
                                    />
                                    
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">Resposta Correta</FormLabel>
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
                                    
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleSave}
                                            startIcon={<Save />}
                                            disabled={editedQuestion.trim() === '' || editedSubject.trim() === ''}
                                            sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
                                        >
                                            Salvar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleCancel}
                                            startIcon={<Cancel />}
                                        >
                                            Cancelar
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                // Modo de visualização
                                <>
                                    <Typography variant="h6" component="div">
                                        Assunto: {subject}
                                    </Typography>

                                    <Typography variant="h6" component="div" sx={{ my: 2 }}>
                                        {question}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="h6" component="div">
                                            Resposta:
                                        </Typography>

                                        {isAnswerVisible ? (
                                            answer === 'V' ? (
                                                <Typography 
                                                    variant="h6" 
                                                    component="div" 
                                                    sx={{ 
                                                        marginLeft: 4, 
                                                        textAlign: 'center',
                                                        color: 'success.main',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => setIsAnswerVisible(!isAnswerVisible)}
                                                >
                                                    Verdadeiro
                                                </Typography>
                                            ) : (
                                                <Typography 
                                                    variant="h6" 
                                                    component="div" 
                                                    sx={{ 
                                                        marginLeft: 4, 
                                                        textAlign: 'center',
                                                        color: 'error.main',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => setIsAnswerVisible(!isAnswerVisible)}
                                                >
                                                    Falso
                                                </Typography>
                                            )
                                        ) : (
                                            <div 
                                                style={{ 
                                                    height: 30, 
                                                    backgroundColor: 'gray', 
                                                    borderRadius: 10, 
                                                    width: '10vw', 
                                                    marginLeft: 10,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setIsAnswerVisible(!isAnswerVisible)} 
                                            />
                                        )}
                                    </Box>
                                </>
                            )}
                        </Container>

                        {/* Botões de ação */}
                        <Container sx={{ flexBasis: '15%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {!isEditing && onEdit && (
                                <IconButton 
                                    color="primary" 
                                    aria-label="Editar questão" 
                                    onClick={handleEdit}
                                    size="small"
                                >
                                    <Edit />
                                </IconButton>
                            )}
                            
                            {hasDelete && !isEditing && (
                                <IconButton 
                                    color="error" 
                                    aria-label="Remover questão" 
                                    onClick={onRemove}
                                    size="small"
                                >
                                    <Close />
                                </IconButton>
                            )}
                        </Container>
                    </CardContent>
                </Card>
            </Grid>
        </div>
    );
}
