import { Card, CardContent, Typography, Grid, Container } from '@mui/material';

export default function QuestionCheckCard({ question, subject, answer }) {

    const getAnswer = (answer) => {
        if (typeof answer === 'string') {
            answer = answer.toLowerCase();
        }

        if (answer === true || answer === 'v' || answer === 'verdadeiro' || answer === 'true') {
            return 'Verdadeiro';
        }

        if (answer === false || answer === 'f' || answer === 'falso' || answer === 'false') {
            return 'Falso';
        }
    }

    return (
        <Grid item xs={6}>
            <Card sx={{ margin: 2, height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="div">
                        {question}
                    </Typography>

                    <Typography variant="h6" component="div" sx={{ my: 2 }}>
                        Assunto: <span style={{ fontWeight: 'bold' }}> {subject} </span>
                    </Typography>

                    <Container sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
                            Resposta: <span style={{ fontWeight: 'bold' }}>{ getAnswer(answer) }</span>
                        </Typography>
                    </Container>
                </CardContent>
            </Card>
        </Grid>
    );
}