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




userSchema.pre("validate", async function (next) {

    const salaryPaths = [
        'salary.basic', 'salary.HRA',
        'salary.PA', 'salary.DA', 'salary.SPA', 'salary.EPF',
        'salary.PT', 'salary.IT', 'salary.conveyance', 'salary.medical',
        'salary.gratuity'
    ];

    if (!this.isModified(...salaryPaths)) {
        return next();
    }

    try {
        this.salary.totalDeductions = (this.salary.basic * this.salary.EPF / 100) +
            (this.salary.basic * this.salary.PT / 100) +
            (this.salary.basic * this.salary.IT / 100);

        // Calculate total earnings
        this.salary.totalEarnings = this.salary.basic +
            (this.salary.basic * (this.salary.HRA / 100 + this.salary.PA / 100 + this.salary.DA / 100 +
                this.salary.SPA / 100 + this.salary.conveyance / 100 + this.salary.medical / 100 +
                this.salary.gratuity / 100));

        // Calculate net salary
        this.salary.netSalary = this.salary.totalEarnings - this.salary.totalDeductions;

    } catch (error) {
        console.error('Error calculating or saving salary:', error);
        throw new Error('Error calculating or saving salary');
    }
    next();
});



export const User = mongoose.model("User", userSchema)