import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true
    },

    present: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    }],
    absent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    }],
}
    , {
        timestamps: true
    }
);



export const Attendance = mongoose.model("Attendance", attendanceSchema); 