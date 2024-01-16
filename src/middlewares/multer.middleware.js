import multer from "multer";
const limit = {
    fieldSize: 1024 * 1024 * 5, // Example: 5 MB limit for the field
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname)
    },

})

export const upload = multer({
    storage, limit
})  