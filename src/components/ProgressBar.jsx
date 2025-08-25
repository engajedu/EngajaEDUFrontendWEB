import { Box, LinearProgress } from "@mui/material";

export default function ProgressBar(props) {
    const buffer = (props.current / props.target) * 100;
    const currentValue = ((props.current - 1) / props.target) * 100;

    return (
      <Box sx={{ width: '100%'}}>
        <Box>
          <LinearProgress variant="buffer" value={currentValue} valueBuffer={buffer}/>
        </Box>
      </Box>
    );
  }
  