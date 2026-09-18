import { Router } from "express";
import type { RoomManager } from "./RoomManager";

export function createHealthRouter(roomManager: RoomManager): Router {
  const router = Router();

  router.get("/healthz", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      activeRooms: roomManager.roomCount,
    });
  });

  router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  return router;
}
