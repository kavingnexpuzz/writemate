import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { toggleThemeMode } from "../store/uiSlice";

export default function HomePage() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.ui.mode);

  return (
    <Box
      sx={{
        minHeight: "100%",
        position: "relative",
        overflow: "hidden",
        px: { xs: 2.5, md: 6 },
        py: { xs: 2, md: 3 },
        background:
          "radial-gradient(circle at 85% 15%, rgba(201,154,52,.16), transparent 24%), radial-gradient(circle at 8% 88%, rgba(59,81,127,.12), transparent 28%)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.35,
          backgroundImage:
            "linear-gradient(rgba(31,45,80,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(31,45,80,.05) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 1240,
          width: "100%",
          mx: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: { xs: 6, md: 10 } }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                display: "grid",
                placeItems: "center",
                borderRadius: 2,
                bgcolor: "secondary.main",
                color: "secondary.contrastText",
                transform: "rotate(-4deg)",
              }}
            >
              <EditNoteIcon />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontFamily: "display", fontWeight: 700 }}
            >
              WriteMate
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              component={RouterLink}
              to="/login"
              color="inherit"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              Log in
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
            >
              Get started
            </Button>
            <IconButton
              onClick={() => dispatch(toggleThemeMode())}
              aria-label="Toggle color mode"
            >
              {mode === "dark" ? (
                <LightModeOutlinedIcon />
              ) : (
                <DarkModeOutlinedIcon />
              )}
            </IconButton>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 7, md: 10 }}
          alignItems="center"
        >
          <Box
            sx={{ flex: 1, maxWidth: 650 }}
            component={motion.div}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Chip
              icon={<LocationOnOutlinedIcon />}
              label="Local talent. Thoughtful work."
              variant="outlined"
              sx={{
                mb: 3,
                borderColor: "secondary.main",
                color: "secondary.dark",
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 48, sm: 64, md: 82 },
                lineHeight: 0.98,
                mb: 3,
              }}
            >
              Put your work in{" "}
              <Box
                component="span"
                sx={{ color: "secondary.main", fontStyle: "italic" }}
              >
                good hands.
              </Box>
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 550, fontWeight: 400, lineHeight: 1.55, mb: 4 }}
            >
              Find trusted local writers for notes, forms, diagrams and
              fair-copy work. Clear briefs, visible progress, no guesswork.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mb: 5 }}
            >
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Find a writer
              </Button>
              <Button
                component={RouterLink}
                to="/writer/register"
                variant="outlined"
                size="large"
                startIcon={<DrawOutlinedIcon />}
              >
                Become a writer
              </Button>
            </Stack>
            <Stack
              direction="row"
              spacing={{ xs: 2, sm: 4 }}
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Box>
                <Typography variant="h6">01</Typography>
                <Typography variant="caption" color="text.secondary">
                  Share your brief
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6">02</Typography>
                <Typography variant="caption" color="text.secondary">
                  Choose your match
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6">03</Typography>
                <Typography variant="caption" color="text.secondary">
                  Track the work
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            sx={{ flex: 1, width: "100%", maxWidth: 500 }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: "primary.main",
                boxShadow: "14px 18px 0 rgba(176,129,42,.22)",
                transform: "rotate(2deg)",
              }}
            >
              <Box
                sx={{
                  bgcolor: "background.paper",
                  p: { xs: 2.5, sm: 4 },
                  minHeight: 390,
                  position: "relative",
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(59,81,127,.10) 32px)",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 5 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "secondary.main",
                      fontWeight: 700,
                    }}
                  >
                    Active brief
                  </Typography>
                  <Chip
                    size="small"
                    icon={<VerifiedOutlinedIcon />}
                    label="Matched"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Data sciences record
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  40 pages · 20 diagrams · Needed by Sep 26
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <SearchRoundedIcon color="secondary" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        3 nearby writers found
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Erode, Tamil Nadu
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <VerifiedOutlinedIcon color="success" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Transparent quotations
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Review before you pay
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
                <Box
                  sx={{
                    position: "absolute",
                    right: 24,
                    bottom: 24,
                    width: 54,
                    height: 54,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    bgcolor: "secondary.main",
                    color: "secondary.contrastText",
                  }}
                >
                  <DrawOutlinedIcon />
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
