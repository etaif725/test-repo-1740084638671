import PropTypes from "prop-types";
import Box from "components/VuiBox";
import Typography from "components/VuiTypography";
import Badge from "components/VuiBadge";
import { useTimeline } from "components/card/Timeline/context";
import { timelineItem } from "components/card/Timeline/TimelineItem/styles";

function TimelineItem({ color, icon, title, dateTime, description, badges, lastItem }) {
  const isDark = useTimeline();

  const renderBadges =
    badges.length > 0
      ? badges.map((badge, key) => {
          const badgeKey = `badge-${key}`;

          return (
            <Box key={badgeKey} mr={key === badges.length - 1 ? 0 : 0.5}>
              <Badge color={color} size="xs" badgeContent={badge} container />
            </Box>
          );
        })
      : null;

  return (
    <Box position="relative" mb="24px" sx={(theme) => timelineItem(theme, { color })}>
      <Box
        width="1.625rem"
        height="1.625rem"
        borderRadius="50%"
        position="absolute"
        top="3.25%"
        left="-8px"
        zIndex={2}
      >
        {icon}
      </Box>
      <Box ml="30px" pt={description ? 0.7 : 0.5} lineHeight={0} maxWidth="30rem">
        <Typography variant="button" fontWeight="medium" color="white">
          {title}
        </Typography>
        <Box mt={0.5}>
          <Typography variant="caption" fontWeight="medium" color="text">
            {dateTime}
          </Typography>
        </Box>
        <Box mt={2} mb={1.5}>
          {description ? (
            <Typography variant="button" fontWeight="regular" color="text">
              {description}
            </Typography>
          ) : null}
        </Box>
        {badges.length > 0 ? (
          <VuiBox display="flex" pb={lastItem ? 1 : 2}>
            {renderBadges}
          </VuiBox>
        ) : null}
      </Box>
    </Box>
  );
}

// Setting default values for the props of TimelineItem
TimelineItem.defaultProps = {
  color: "info",
  badges: [],
  lastItem: false,
  description: "",
};

// Typechecking props for the TimelineItem
TimelineItem.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "light",
  ]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  dateTime: PropTypes.string.isRequired,
  description: PropTypes.string,
  badges: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  lastItem: PropTypes.bool,
};

export default TimelineItem;
