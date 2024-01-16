import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    leaveType: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "pending",
    },
    fromDate: {
        type: String,
        required: true,
    },
    toDate: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: false,
    },

},
    {
        timestamps: true,
    }
);

export const Leave = mongoose.model("Leave", leaveSchema); 