import { Box, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import billingCard from "@/public/assets/bg/billing-background-card.png";
import PropTypes from "prop-types";
import { RiMastercardFill } from "react-icons/ri";

function MasterCard({ number, valid, cvv }) {
  const numbers = [...`${number}`];

  if (numbers.length < 16 || numbers.length > 16) {
    throw new Error(
      "Invalid value for the prop number, the value for the number prop shouldn't be greater than or less than 16 digits"
    );
  }

  const num1 = numbers.slice(0, 4).join("");
  const num2 = numbers.slice(4, 8).join("");
  const num3 = numbers.slice(8, 12).join("");
  const num4 = numbers.slice(12, 16).join("");

  return (
    <Card sx={{ background: `url('${billingCard}')`, backdropfilter: "blur(31px)" }}>
      <Box p={2} pt={0}>
        <Box
          color="white"
          lineHeight={0}
          display="flex"
          justifyContent="space-beetween"
          alignItems="center"
          width="100%"
          sx={{ width: "100%" }}
        >
          <Typography color="white" fontWeight="bold" mr="auto">
            Vision UI
          </Typography>
          <RiMastercardFill size="48px" color="white" />
        </Box>
        <Typography
          variant="h4"
          color="white"
          mt="auto"
          fontWeight="medium"
          sx={({ breakpoints }) => ({
            mt: 8,
            pb: 1,
            [breakpoints.only("sm")]: {
              fontSize: "22px",
            },
          })}
        >
          {num1}&nbsp;&nbsp;&nbsp;{num2}&nbsp;&nbsp;&nbsp;{num3}&nbsp;&nbsp;&nbsp;{num4}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Box mr={3} lineHeight={1}>
              <Typography color="white" fontWeight="medium">
                VALID THRU
              </Typography>
              <Typography
                variant="h6"
                color="white"
                fontWeight="medium"
                textTransform="capitalize"
              >
                {valid}
              </Typography>
            </Box>
            <Box lineHeight={1}>
              <Typography color="white" fontWeight="medium">
                CVV
              </Typography>
              <Typography variant="h6" color="white" fontWeight="medium">
                {cvv}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

// Setting default values for the props of MasterCard
MasterCard.defaultProps = {
  color: "dark",
};

// Typechecking props for the MasterCard
MasterCard.propTypes = {
  color: PropTypes.oneOf([
    "white",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "text",
  ]),
};

export default MasterCard;
