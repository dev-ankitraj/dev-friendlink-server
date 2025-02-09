import multer from 'multer';

// Storage User Profile Pics
const storageUserProfilePics = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/pics");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const uploadUserAvatar = multer({
    storage: storageUserProfilePics
});

// Storage User Posts
const storageUserPosts = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/posts");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const uploadUserPost = multer({
    storage: storageUserPosts
});

// Storage Temp Files
const storageTempFiles = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/temp");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const uploadTempFile = multer({
    storage: storageTempFiles
});

