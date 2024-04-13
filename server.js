const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
app.use(cors());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());

//create multer storage and file filter function
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

//App Start
mongoose
  .connect("mongodb+srv://MacSmith:4PZSmC7dS12T8xMi@data.vpbjhop.mongodb.net/?retryWrites=true&w=majority&appName=data")
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

//create database craft schema
const craftSchema = new mongoose.Schema({
  name: String,
  img: String,
  description: String,
  supplies: [String]
})
const Craft = mongoose.model("Craft", craftSchema);

// app routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// get all
app.get("/api/crafts", (req, res) => {
  getCrafts(res)
});

//get one
app.get("/api/crafts/:id", (req, res) => {
    getCraft(res, req.params.id)
});

//add a craft
app.post("/api/crafts", upload.single("img"), (req, res) => {
    const result = validateCraft(req.body);

    if (result.error) {
        res.status(400).json({ errors: result.error.details.map(detail => detail.message) });
        return;
    }

    const craft = new Craft({
      name: req.body.name,
      description: req.body.description,
      supplies: req.body.supplies.split(","),
    });

    if (req.file) {
      craft.img =  +req.file.filename;
    }

    createCraft(res, craft);
});

//update a craft
app.put("/api/crafts/:id", upload.single("img"), (req, res) => {
      const result = validateCraft(req.body);
      if (result.error) {
        res.status(400).json({ errors: result.error.details.map(detail => detail.message) });
        return;
      }
      updateCraft(req,res);
});

//delete craft
app.delete("/api/crafts/:id", (req,res)=>{
        removeCraft(res, req.params.id);
});

//app functions
const getCrafts = async (res) => {
    const crafts = await Craft.find();
    res.send(crafts);
}

const getCraft = async (res, id) => {
    const craft = await Craft.findOne({_id:id})
    res.send(craft);
}

const createCraft = async (res, craft) => {
    const result = await craft.save();
    res.send(result);
}

const updateCraft = async (req,res) => {
      let updatefields ={
        name: req.body.name,
        description: req.body.description,
        supplies: req.body.supplies.split(","),
      };
      if(req.file) {
        updatefields.img = req.file.filename;
      }
      const result = await Craft.updateOne({_id: req.params.id}, updatefields);
      res.send(result);
}

const removeCraft = async (res, id) => {
      const result = await Craft.findByIdAndDelete(id);
      res.send(result);
}

//validation
const validateCraft = (craft) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    supplies: Joi.allow(""),
    name: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
  });
  const result = schema.validate(craft);
  return result;
};

//server
app.listen(3000, () => {
  console.log("serving port 3000");
});
