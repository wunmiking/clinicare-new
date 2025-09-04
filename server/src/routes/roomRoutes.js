import express from "express";
import { verifyAuth, authorizedRoles } from "../middlewares/authenticate.js";
import { validateFormData } from "../middlewares/validateForm.js";
import { validateRoomSchema } from "../utils/dataSchema.js";
import { clearCache, cacheMiddleware } from "../middlewares/cache.js";
import {
  createRoom,
  getAllRooms,
  getRoomMeta,
  updateRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.get(
  "/meta",
  verifyAuth,
  authorizedRoles("admin"),
  cacheMiddleware("room_meta", 30000),
  getRoomMeta
);

router.post(
  "/create",
  verifyAuth,
  authorizedRoles("admin"),
  validateFormData(validateRoomSchema),
  clearCache("rooms"),
  createRoom
);

router.get(
  "/all",
  verifyAuth,
  authorizedRoles("admin"),
  cacheMiddleware("rooms", 10600),
  getAllRooms
);

router.patch(
  "/:id/update",
  verifyAuth,
  authorizedRoles("admin"),
  validateFormData(validateRoomSchema),
  clearCache("rooms"),
  updateRoom
);


export default router;
