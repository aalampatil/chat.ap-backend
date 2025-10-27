import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });

//upload.single for 1 file, just do it ----  req.file.properties
//upload.fields([ {}, {}]) for more than 1 file, just do it ---- req.file.file[0].properties