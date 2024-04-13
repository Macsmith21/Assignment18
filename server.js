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


//App Start

//connect to mongodb
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
const craft = mongoose.model("Craft", craftSchema);

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


// app routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// get all
app.get("/api/crafts", (req, res) => {
  getCrafts(res)

});
const getCrafts = async (res) => {
    const crafts = await craft.find();
    res.send(crafts);
}

//get one
app.get("/api/crafts/:id", (req, res) => {
    getCraft(res, req.params.id)
  });
  const getCraft = async (res, id) => {
    const craft = await craft.findOne({_id:id})
    res.send(craft);
}
//add a craft
app.post("/api/crafts", upload.single("img"), (req, res) => {
  const result = validateCraft(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const craft = new Craft({
    name: req.body.name,
    description: req.body.description,
    supplies: req.body.supplies.split(","),
  });

  if (req.file) {
    craft.img =  "images/"+req.file.filename;
  }

  createCraft(res, craft);
const createCraft = async (res, craft) => {
    const result = await craft.save();
    res.send(result);
}
});



app.put("/api/crafts/:id", upload.single("img"), (req, res) => {
    const craft = crafts.find((r)=>r._id === parseInt(req.params.id));
    
    if(!craft){
      res.send(404).send("Craft with given id was not found");
    }
  
  
    const result = validateCraft(req.body);
  
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }
  
   
  });
  const updateCraft = async (req,res) => {
      let updatefields ={
        name: req.body.name,
        description: req.body.description,
        supplies: req.body.supplies.split(","),
      }
      if(req.file) {
        updateCraft.img = "images/"+req.file.filename;
      }
      const result = await craft.updateOne({_id: req.params.id}, updatefields);
  }


  
  app.delete("/api/crafts/:id", (req,res)=>{
    const craft = crafts.find((r)=>r._id === parseInt(req.params.id));
  
    if(!craft){
      res.status(404).send("The craft with the given id was not found");
      return;
    }
  
    const index = crafts.indexOf(craft);
    crafts.splice(index, 1);
    res.send(craft);
  });
  
  

const validateCraft = (craft) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    supplies: Joi.allow(""),
    name: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
  });

  return schema.validate(craft);
};

app.listen(3000, () => {
  console.log("serving port 3000");
});