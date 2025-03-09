import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Box from "components/VuiBox";
import Typography from "components/VuiTypography";
import { TimelineProvider } from "components/card/Timeline/context";

function TimelineList({ title, dark, children }) {
  return (
    <TimelineProvider value={dark}>
      <Card>
        <Box bgColor={dark ? "dark" : "white"} variant="gradient">
          <Box pt={3} px={3}>
            <Typography variant="h6" fontWeight="medium" color={dark ? "white" : "dark"}>
              {title}
            </Typography>
          </Box>
          <Box p={2}>{children}</Box>
        </Box>
      </Card>
    </TimelineProvider>
  );
}

// Setting default values for the props of TimelineList
TimelineList.defaultProps = {
  dark: false,
};

// Typechecking props for the TimelineList
TimelineList.propTypes = {
  title: PropTypes.string.isRequired,
  dark: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default TimelineList;
