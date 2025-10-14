/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from "@adonisjs/core/services/router";
import { middleware } from "#start/kernel";

const AuthController = () => import("#controllers/auth_controller");
const ModeController = () => import("#controllers/users/mode_controller");
const ProgramsController = () => import("#controllers/rehab/programs_controller");
const RehabLogsController = () => import("#controllers/rehab/logs_controller");
const WellnessLogsController = () => import("#controllers/wellness/logs_controller");
const RehabSummaryController = () => import("#controllers/sessions/rehab_summary_controller");

router.get("/", async () => {
  return {
    hello: "world",
  };
});

// Auth routes - public (no middleware)
router
  .group(() => {
    router.post("/register", [AuthController, "register"]);
    router.post("/login", [AuthController, "login"]);
  })
  .prefix("/api/auth");

// Auth routes - protected (auth + timezone)
router
  .group(() => {
    router.post("/logout", [AuthController, "logout"]);
    router.get("/me", [AuthController, "me"]);
  })
  .prefix("/api/auth")
  .use([middleware.auth(), middleware.timezone()]);

// User mode management (protected)
router
  .group(() => {
    router.patch("/mode", [ModeController, "update"]);
  })
  .prefix("/api/users")
  .use([middleware.auth(), middleware.timezone()]);

// Rehab programs (protected)
router
  .group(() => {
    router.post("/", [ProgramsController, "create"]);
    router.get("/", [ProgramsController, "index"]);
    router.patch("/:id/status", [ProgramsController, "updateStatus"]);
  })
  .prefix("/api/rehab-programs")
  .use([middleware.auth(), middleware.timezone()]);

// Rehab logs (protected)
router
  .group(() => {
    router.post("/", [RehabLogsController, "create"]);
    router.get("/", [RehabLogsController, "index"]);
  })
  .prefix("/api/rehab-logs")
  .use([middleware.auth(), middleware.timezone()]);

// Wellness logs (protected)
router
  .group(() => {
    router.post("/", [WellnessLogsController, "create"]);
    router.get("/", [WellnessLogsController, "index"]);
  })
  .prefix("/api/wellness-logs")
  .use([middleware.auth(), middleware.timezone()]);

// AI sessions (protected)
router
  .group(() => {
    router.post("/rehab-summary", [RehabSummaryController, "create"]);
  })
  .prefix("/api/sessions")
  .use([middleware.auth(), middleware.timezone()]);
