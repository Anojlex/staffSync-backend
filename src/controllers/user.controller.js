import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Leave } from "../models/leave.model.js";
import { Attendance } from "../models/attendance.model.js";

const convertToDDMMYYYY = (inputDate) => {
    const dateParts = inputDate.split("-");
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    return `${day}-${month}-${year}`;
}

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {

        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {


    const { firstname, lastname, email, phone, password, empID, joiningDate, department, designation } = req.body


    if (
        [firstname, lastname, email, phone, password, empID, joiningDate, department, designation].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ phone }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or phone already exists")
    }



    const user = await User.create({
        firstname,
        lastname,
        email,
        phone,
        password,
        empID,
        joiningDate,
        department,
        designation

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})


const loginUser = asyncHandler(async (req, res) => {


    const { email, password } = req.body


    if (!email) {
        throw new ApiError(400, " email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken,
                },
                "User logged In Successfully"
            )
        )

})


const logoutUser = asyncHandler(async (req, res) => {
    console.log(req.user._id);
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
        const loggedInUser = await User.findById(decodedToken?._id).select("-password -refreshToken")

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { user: loggedInUser, accessToken, refreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword, employeeId } = req.body
    console.log(req.body);
    const user = await User.findById(employeeId)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {

    const {
        employeeId,
        firstname,
        lastname,
        email,
        phone,
        empID,
        joiningDate,
        department,
        designation,
        education,
        experience,
        houseNo,
        locality,
        landmark,
        city,
        district,
        state,
        country,
        pincode,
        name,
        relation,
        contactNumber,
        bloodGroup,
        DOB,
        anniversaryDate,
        maritalStatus,
        basic,
        HRA,
        PA,
        DA,
        SPA,
        EPF,
        PT,
        IT,
        conveyance,
        medical,
        bonus,
        gratuity,
    } = req.body;



    const updateFields = {};
    const address = {};
    const emergency = {}
    const salary = {};
    if (firstname) {
        updateFields.firstname = firstname;
    }
    if (lastname) {
        updateFields.lastname = lastname;
    }
    if (email) {
        updateFields.email = email;
    }
    if (phone) {
        updateFields.phone = phone;
    }
    if (empID) {
        updateFields.empID = empID;
    }
    if (joiningDate) {
        updateFields.joiningDate = joiningDate
    }
    if (department) {
        updateFields.department = department;
    }
    if (designation) {
        updateFields.designation = designation;
    }
    if (experience) {
        if (!updateFields.experience) {
            updateFields.experience = [];
        }

        for (let i = 0; i < experience.length; i++) {
            if (experience[i]) {

                if (!updateFields.experience[i]) {
                    updateFields.experience[i] = {};
                }

                if (experience[i].designation) {
                    updateFields.experience[i].designation = experience[i].designation;
                }
                if (experience[i].company) {
                    updateFields.experience[i].company = experience[i].company;
                }
                if (experience[i].year) {
                    updateFields.experience[i].year = experience[i].year;
                }
            }

        }
    }
    if (education) {
        if (!updateFields.education) {
            updateFields.education = [];
        }

        for (let i = 0; i < education.length; i++) {
            if (education[i]) {
                // Initialize education[i] object if not already present
                if (!updateFields.education[i]) {
                    updateFields.education[i] = {};
                }

                if (education[i].degree) {
                    updateFields.education[i].degree = education[i].degree;
                }
                if (education[i].year) {
                    updateFields.education[i].year = education[i].year;
                }
                if (education[i].institution) {
                    updateFields.education[i].institution = education[i].institution;
                }
            }

        }
    }
    if (houseNo) {
        address.houseNo = houseNo;
    }
    if (locality) {
        address.locality = locality;
    }
    if (landmark) {
        address.landmark = landmark;
    }
    if (city) {
        address.city = city;
    }
    if (district) {
        address.district = district;
    }
    if (state) {
        address.state = state;
    }
    if (country) {
        address.country = country;
    }
    if (pincode) {
        address.pincode = pincode;
    }
    if (Object.keys(address).length > 0) {
        updateFields.address = address;
    }

    if (name) {
        emergency.name = name;
    }
    if (relation) {
        emergency.relation = relation;
    }
    if (contactNumber) {
        emergency.contactNumber = contactNumber;
    }
    if (bloodGroup) {
        emergency.bloodGroup = bloodGroup;
    }
    if (Object.keys(emergency).length > 0) {
        updateFields.emergency = emergency;
    }

    if (DOB) {
        updateFields.DOB = DOB;
    }
    if (maritalStatus) {
        updateFields.maritalStatus = maritalStatus;
    }
    if (anniversaryDate) {
        updateFields.anniversaryDate = anniversaryDate;
    }
    if (basic) {
        salary.basic = basic;
    }
    if (HRA) {
        salary.HRA = HRA;
    }
    if (PA) {
        salary.PA = PA;
    }
    if (DA) {
        salary.DA = DA;
    }
    if (SPA) {
        salary.SPA = SPA;
    }
    if (EPF) {
        salary.EPF = EPF;
    }
    if (PT) {
        salary.PT = PT;
    }
    if (IT) {
        salary.IT = IT;
    }
    if (conveyance) {
        salary.conveyance = conveyance;
    }
    if (medical) {
        salary.medical = medical;
    }
    if (bonus) {
        salary.bonus = bonus;
    }
    if (gratuity) {
        salary.gratuity = gratuity;
    }
    if (Object.keys(salary).length > 0) {
        updateFields.salary = salary;
    }

    const user = await User.findByIdAndUpdate(
        employeeId,
        { $set: updateFields },
        { new: true }
    ).select("-password");


    const users = await User.find({})


    return res.status(200).json(new ApiResponse(200, users, "Account details updated successfully"));
});


const updateUserAvatar = asyncHandler(async (req, res) => {
    console.log(req.body);
    const avatarLocalPath = req.file?.path
    const { employeeId } = req.body
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")

    }

    await User.findByIdAndUpdate(
        employeeId,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")
    const users = await User.find({})
    return res
        .status(200)
        .json(
            new ApiResponse(200, users, "Avatar image updated successfully")
        )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover image updated successfully")
        )
})

const getEmployeeData = asyncHandler(async (_, res) => {

    const employeeData = await User.find({})

    return res.status(201).json(
        new ApiResponse(200, employeeData, "Users data fetched Successfully")
    )
})

const applyLeave = asyncHandler(async (req, res) => {

    const { date, employeeId, leaveType, reason, fromDate, toDate, } = req.body

    const leave = await Leave.create({
        date: date,
        employeeId: employeeId,
        leaveType: leaveType,
        reason: reason,
        fromDate: fromDate,
        toDate: toDate,
    })
    res.status(201).json(
        new ApiResponse(201, leave, "Leave applied Successfully")
    )
})

const leavedata = asyncHandler(async (req, res) => {
    const leave = await Leave.find({})
        .populate({
            path: 'employeeId',
            model: 'User',
            select: 'firstname lastname  leave'
        });

    res.status(201).json(
        new ApiResponse(201, leave, "Leave fetched successfully")
    );
});

const leaveAction = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { id, action, comment } = req.body;
    let status = "";
    let updateFields = {}

    if (action === "Reject") {
        status = "Rejected"
    } else if (action === "Approve") {
        status = "Approved";
    }

    if (action) {
        updateFields.status = status
    }
    if (comment) {
        updateFields.comment = comment
    }
    if (!comment) {
        updateFields.comment = ""
    }

    await Leave.findByIdAndUpdate(id, { $set: updateFields });

    const leave = await Leave.find({})
        .populate({
            path: 'employeeId',
            model: 'User',
            select: 'firstname lastname salary leave'
        });
    res.status(201).json(
        new ApiResponse(201, leave, "Leave updated successfully")
    );
});

const addAttendance = asyncHandler(async (req, res) => {
    const { date, present, absent } = req.body

    const attendance = await Attendance.create({
        date: date,
        present: [present],
        absent: [absent]
    })
    res.status(201).json(
        new ApiResponse(201, attendance, "Attendance added Successfully")
    )
})

const attendanceData = asyncHandler(async (req, res) => {

    const attendance = await Attendance.find({})
        .populate({
            path: 'present',
            model: 'User',
            select: 'firstname lastname empID leave'
        })
        .populate({
            path: 'absent',
            model: 'User',
            select: 'firstname lastname empID leave'
        });
    res.status(201).json(
        new ApiResponse(201, attendance, "Attendance fetched successfully")
    );
}
)

const updateAttendance = asyncHandler(async (req, res) => {

    const { date, id, action } = req.body;

    try {
        if (action === "Present" || action === "Absent") {
            let dateExist = await Attendance.findOne({ date: date });

            if (!dateExist) {
                const attendance = await Attendance.create({
                    date: date,
                    present: action === "Present" ? [id] : [],
                    absent: action === "Absent" ? [id] : []
                });
                const attendanceData = await Attendance.find({})
                    .populate({
                        path: 'present',
                        model: 'User',
                        select: 'firstname lastname empID leave'
                    })
                    .populate({
                        path: 'absent',
                        model: 'User',
                        select: 'firstname lastname empID leave'
                    });
                return res.status(200).json(
                    new ApiResponse(200, attendanceData, "Attendance added Successfully")
                );
            }

            const updateQuery = {
                $addToSet: {
                    present: action === "Present" ? id : undefined,
                    absent: action === "Absent" ? id : undefined
                }
            };

            // If switching from Present to Absent, remove from present array
            if (action === "Absent") {
                updateQuery.$pull = { present: id };
            }

            // If switching from Absent to Present, remove from absent array
            if (action === "Present") {
                updateQuery.$pull = { absent: id };
            }

            const updatedAttendance = await Attendance.findOneAndUpdate(
                { date: date },
                updateQuery,
                { new: true }
            );
            const attendance = await Attendance.find({})
                .populate({
                    path: 'present',
                    model: 'User',
                    select: 'firstname lastname empID leave'
                })
                .populate({
                    path: 'absent',
                    model: 'User',
                    select: 'firstname lastname empID leave'
                });

            return res.status(200).json(
                new ApiResponse(200, attendance, "Attendance updated Successfully")
            );
        } else {
            return res.status(400).json(
                new ApiResponse(400, null, "Invalid action. Accepted values are 'Present' or 'Absent'")
            );
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(
            new ApiResponse(500, null, "Internal Server Error")
        );
    }
});

const calculateSalary = asyncHandler(async (req, res) => {
    const { id } = req.body;

    const user = await User.findById(id);
    const salary = user.calculateSalary();

    return res.status(200).json(
        new ApiResponse(200, salary, "Salary calculated successfully")
    );
});


const addToDo = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { employeeId, todo } = req.body;

    if (!req.body.employeeId) {
        return res.status(400).json(
            new ApiResponse(400, null, "Employee ID is required")
        );
    }
    if (!req.body.todo) {
        return res.status(400).json(
            new ApiResponse(400, null, "Todo is required")
        );
    }

    const user = await User.findById(employeeId);
    user.todo.push(todo);
    await user.save();
    const users = await User.find({});
    return res.status(200).json(
        new ApiResponse(200, users, "Todo added successfully")
    );
})


const editToDo = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { employeeId, todoId, todo } = req.body;

    if (!req.body.employeeId || !req.body.todoId || !req.body.todo) {
        return res.status(400).json(
            new ApiResponse(400, null, "Employee ID, Todo ID and Todo are required")
        );
    }


    const user = await User.findById(employeeId);
    const todoIndex = user.todo.findIndex((t) => t._id.toString() === todoId);
    if (todoIndex === -1) {
        return res.status(404).json(
            new ApiResponse(404, null, "Todo not found")
        );
    }
    user.todo[todoIndex] = todo;
    await user.save();
    const users = await User.find({});
    return res.status(200).json(
        new ApiResponse(200, users, "Todo updated successfully")
    );


})


const deleteToDo = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { employeeId, todoId } = req.body;

    if (!req.body.employeeId || !req.body.todoId) {
        return res.status(400).json(
            new ApiResponse(400, null, "Employee ID and Todo ID are required")
        );
    }

    const user = await User.findById(employeeId);
    const todoIndex = user.todo.findIndex((t) => t._id.toString() === todoId);
    if (todoIndex === -1) {
        return res.status(404).json(
            new ApiResponse(404, null, "Todo not found")
        );
    }
    user.todo.splice(todoIndex, 1);
    await user.save();
    const users = await User.find({});
    return res.status(200).json(
        new ApiResponse(200, users, "Todo deleted successfully")
    );

});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getEmployeeData,
    applyLeave,
    leavedata,
    leaveAction,
    addAttendance,
    attendanceData,
    updateAttendance,
    calculateSalary,
    addToDo,
    editToDo,
    deleteToDo
}
