import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

const APIKEY = "2d628e36b4fc238280d1877a63f1e917";

const app = express();
const PORT = 4000;

const connectionLink =
  "mongodb+srv://quickfi0408:priyanshu@cluster0.2iog7ls.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

try {
  mongoose.connect(connectionLink);
  console.log("connection with MonogDB successful");
} catch (error) {
  console.log("Error while connecting to MOngoDB", error);
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const User = new mongoose.model("User", userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(
  {
    origin:["https://weather-frontend-liart.vercel.app"],
    methods:["POST","GET"],
    credentials: false
));



app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/register", async (req, res) => {
  const userData = req.body;
  console.log(userData);
  try {
    const userExist = await User.findOne({ email: userData.email });
    if (userExist) {
      return res.status(401).send({ message: "User Already Exist" });
    }
    const user = new User(userData);
    await user.save();
    if (user) {
      return res.status(200).send({ message: "Registered Successfully" });
    }
    res.status(500).send("Caught some problem");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/login", async (req, res) => {
  const userData = req.body;
  console.log(userData);
  try {
    const userExist = await User.findOne({ email: userData.email });
    console.log(userExist);
    if (!userExist) {
      return res.status(403).send({ message: "User Do not Exist" });
    }
    if (userExist.password !== userData.password) {
      return res.status(405).send({ message: "Wrong Password" });
    }
    return res.status(200).send({ message: "Successfully Logged In" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/weather", async (req, res) => {
  const { place, latitude, longitude } = req.body;
  console.log(req.body);
  try {
    let receivedData;
    if (place) {
      receivedData = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${APIKEY}&units=metric`
      );
      res.send(receivedData.data);
      console.log(receivedData.data);
    } else {
      receivedData = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${APIKEY}&units=metric`
      );
      res.send(receivedData.data);
    }
  } catch (error) {
    console.log(`Error in your code:${error.message}`);
    res.status(404).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port.`);
});
