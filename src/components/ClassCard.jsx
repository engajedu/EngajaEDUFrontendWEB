import { useMemo } from "react";
import getRandomImage from "../utils/getRandomImage";
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const ClassCard = ({ classroom }) => {
    const randomImage = useMemo(() => getRandomImage('class'), []);

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card>
                <CardActionArea component={Link} to={`/classes/${classroom.codigo}`}>
                    <CardMedia
                        component="img"
                        height="140"
                        image={randomImage}
                        alt={classroom.nome}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {classroom.nome}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {classroom.periodo}
                        </Typography>

                    </CardContent>
                </CardActionArea>

                {/* <CardActions>
                    <Button size="small" color="primary" component={Link} to='/lobby'>
                        Questionário para esta turma
                    </Button>
                </CardActions> */}

            </Card>
        </Grid>
    )
}

export default ClassCard;