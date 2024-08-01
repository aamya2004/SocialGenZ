dotenv.config();
import dotenv from "dotenv";
import express from "express";
const app = express();
import router from "./routes/auth.js";
import cors from "cors";
import bodyParser from "body-parser";
// import Connection from "./database/connectDB.js";
var PORT = process.env.PORT || 8000;

app.use(cors());

// Connection();


app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", router);
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});