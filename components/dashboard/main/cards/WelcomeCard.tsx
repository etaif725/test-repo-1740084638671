import React from "react";
import { Card, Icon } from "@mui/material";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { User } from "@supabase/supabase-js";
import welcome from "@/public/assets/home/green-lightning.svg";
interface WelcomeCardProps {
  user: User;
  userDetails: { [key: string]: any };
}

const Welcome = ({ user, userDetails }: WelcomeCardProps) => {
  return (
    <Card
      sx={({ breakpoints }) => ({
        background: `url(${welcome.src})`,
        backgroundSize: "cover",
        borderRadius: "8px",
        height: "100%",
        [breakpoints.only("xl")]: {
          gridArea: "1 / 1 / 2 / 2",
        },
      })}
    >
      <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
        <Box display="flex" flexDirection="column" mb="auto">
          <Typography className="mx-3 mt-4 mb- text-4xl font-bold text-black dark:text-white items-center text-center md:text-start">
          👋 Welcome back, {user?.user_metadata.full_name?.split(' ')[0]}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default Welcome;