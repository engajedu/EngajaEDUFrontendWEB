import { useRef, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Container, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useDrag, useDrop } from 'react-dnd';

export default function QuestionCard({ index, question, subject, answer, hasDelete = false, onRemove = null, moveCard }) {
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const ref = useRef(null)
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
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.QUESTION,
    item: () => {
      return { index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

    return (
        <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
            <Grid item xs={12}>
                <Card sx={{ mb: 4, height: '100%', transition: 'transform 0.2s ease, background-color 0.2s ease', }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        <Container sx={{ display: 'flex', flexDirection: 'column' }}>
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
                                        <Typography variant="h6" component="div" sx={{ marginLeft: 4, textAlign: 'center' }}
                                            onClick={() => setIsAnswerVisible(!isAnswerVisible)}
                                        >
                                            Verdadeiro
                                        </Typography>
                                    ) : (
                                        <Typography variant="h6" component="div" sx={{ marginLeft: 4, textAlign: 'center' }}
                                            onClick={() => setIsAnswerVisible(!isAnswerVisible)}
                                        >
                                            Falso
                                        </Typography>
                                    )
                                ) : (
                                    <div style={{ height: 30, backgroundColor: 'gray', borderRadius: 10, width: '10vw', marginLeft: 10 }}
                                        onClick={() => setIsAnswerVisible(!isAnswerVisible)} />
                                )}
                            </Box>
                        </Container>

                        {
                            hasDelete && (
                                <Container sx={{ flexBasis: '10%'}}>
                                    <IconButton color="error" aria-label="Remover questão" onClick={onRemove}>
                                        <Close />
                                    </IconButton>
                                </Container>
                            )
                        }

                    </CardContent>
                </Card>
            </Grid>
        </div>
    );
}