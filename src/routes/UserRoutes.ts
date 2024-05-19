/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import { acceptFollowRequest, createAccount, deleteProfilePhoto, finishGoal, follow, getAccount, getBodyValues, getProfile, putBodyValues, unfollow, updateAccount, updateCalendar, updateProfilePhoto, updateStatistics } from '../controllers/UserController';
import { authenticationMiddleware } from "../middlewares/authentication";
import { validateBody, validateQuery } from '../validation/UserValidation';
const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype === "image/webp") {
      cb(null, true)
    } else {
      cb(null ,false);
  }
}


const upload = multer({fileFilter, limits: { fileSize: 1000000 },})

export const router = Router();


// Security
router.use("/", authenticationMiddleware)

// User Profile Picture
router.use("/photo", express.static(path.join(__dirname, '../../data/users')))

// Get User
router.get("/", validateQuery("getUser"), validateBody("getUser"), getAccount)
router.get("/profile/:userId", validateQuery("getProfile"), validateBody("getProfile"), getProfile)

// Set/Post, Update/Put user
router.post("/", validateQuery("createUser"), validateBody("createUser"), createAccount)
router.put("/",  validateQuery("updateUser"), validateBody("updateUser"),  updateAccount)

// Upload/Delete Profile Photo
router.put("/photo", upload.single('image'), updateProfilePhoto)
router.delete("/photo", validateQuery("deletePhoto"), validateBody("createPhoto"), deleteProfilePhoto)

// Update Statistics
router.post("/statistics/goal/finish/:goalId", validateQuery("finishGoal"), validateBody("finishGoal"), finishGoal)
router.put("/statistics", validateQuery("updateStatistics"), validateBody("updateStatistics"), updateStatistics)

// Update Calendar
router.put("/calendar", validateQuery("updateCalendar"), validateBody("updateCalendar"), updateCalendar)

router.put("/friends/accept", validateQuery("acceptFollow"), validateBody("acceptFollow"), acceptFollowRequest)
router.put("/friends", validateQuery("follow"), validateBody("follow"), follow)
router.delete("/friends", validateQuery("unfollow"), validateBody("unfollow"), unfollow)



// Update Calendar
router.put("/body", validateQuery("putBodyValues"), validateBody("putBodyValues"), putBodyValues)
router.get("/body", validateQuery("getBodyValues"), validateBody("getBodyValues"), getBodyValues)

export const UserRouter = router