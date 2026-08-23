import express from "express";
import { tts, getHistory, deleteTts } from "../controllers/tts.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection,protectRoute);

router.post("/", tts);

router.get("/history", getHistory)

router.delete("/:id", deleteTts);

export default router;

