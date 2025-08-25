import { Avatar, Card, CardHeader, Grid } from "@mui/material";
import { Person } from '@mui/icons-material';
import getFirstNames from '../utils/getFirstNames';

export default function StudentCard ({ student }) {
    return (
        <Grid item xs={12} sm={6} md={4} >
            <Card key={student._id}>
                <CardHeader
                    avatar={
                        <Avatar aria-label="student">
                            <Person/>
                        </Avatar>
                    }
                    title={getFirstNames(student.nome || student.Nome)}
                    subheader={student.matricula || student.Matricula}
                />
            </Card>
        </Grid>
    )
}