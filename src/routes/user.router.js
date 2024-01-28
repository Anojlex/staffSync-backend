import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    getEmployeeData,
    applyLeave,
    leavedata,
    leaveAction,
    addAttendance,
    attendanceData,
    updateAttendance
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/logout-user").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-details").patch(updateAccountDetails)

router.route("/avatar").patch(upload.single("avatar"), updateUserAvatar)

router.route("/employeeData").get(getEmployeeData)

router.route("/apply-leave").post(applyLeave)

router.route("/leavedata").get(leavedata)

router.route("/leave-action").post(leaveAction)

router.route("/add-attendance").post(addAttendance)

router.route("/attendanceData").get(attendanceData)

router.route("/update-attendance").post(updateAttendance)

export default router 