import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        firstname: {
            type: String,
            required: true,
            index: true,
        },
        lastname: {
            type: String,
            required: true,

        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,

        },
        avatar: {
            type: String,
            required: false,
        },

        password: {
            type: String,
            required: [true, 'Password is required']
        },
        empID: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        joiningDate: {
            type: String,
            required: true
        },
        department: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true
        },
        education: [
            {
                degree: {
                    type: String,
                    required: false
                },
                institution: {
                    type: String,
                    required: false
                },
                year: {
                    type: String,
                    required: false
                }
            }
        ],
        experience: [
            {
                designation: {
                    type: String,
                    required: false
                },
                company: {
                    type: String,
                    required: false
                },
                year: {
                    type: String,
                    required: false
                }
            }
        ],
        address: {
            houseNo: {
                type: String,
                required: false
            },
            locality: {
                type: String,
                required: false

            },
            landmark: {
                type: String,
                required: false
            },

            city: {
                type: String,
                required: false
            },
            district: {
                type: String,
                required: false
            },
            state: {
                type: String,
                required: false
            },
            country: {
                type: String,
                required: false
            },
            pincode: {
                type: String,
                required: false
            }
        },
        emergency: {
            name: {
                type: String,
                required: false
            },
            relation: {
                type: String,
                required: false

            },
            contactNumber: {
                type: String,
                required: false
            },

            bloodGroup: {
                type: String,
                required: false
            },
        },
        DOB: {
            type: String,
            required: false
        },
        maritalStatus: {
            type: String,
            required: false
        },
        anniversaryDate: {
            type: String,
            required: false
        },

        refreshToken: {
            type: String
        },
        salary: {
            basic: {
                type: Number,
                required: false
            },
            HRA: {
                type: Number,
                required: false
            },
            PA: {
                type: Number,
                required: false
            },
            DA: {
                type: Number,
                required: false
            },

            SPA: {
                type: Number,
                required: false
            },

            EPF: {
                type: Number,
                required: false
            },

            PT: {
                type: Number,
                required: false
            },
            IT: {
                type: Number,
                required: false
            },
            conveyance: {
                type: Number,
                required: false
            },
            medical: {
                type: Number,
                required: false
            },
            bonus: {
                type: Number,
                required: false
            },
            gratuity: {
                type: Number,
                required: false
            },
            totalDeductions: {
                type: Number,
                required: false
            },
            totalEarnings: {
                type: Number,
                required: false
            },
            netSalary: {
                type: Number,
                required: false
            },
        },
        role: {
            type: String,
            required: true,
            default: "employee",
        }

    },

    {
        timestamps: true
    }

)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            phone: this.phone
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}





export const User = mongoose.model("User", userSchema)