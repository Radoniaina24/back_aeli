const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const { globalErrHandler, notFound } = require("./middlewares/globaErrHandler");
const path = require("path");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, // Permet d'envoyer des cookies
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));
require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const port = process.env.PORT;
dbConnect();
app.use(express.json());
// ***********//
const applicationRoutes = require("./routes/registerRoutes");
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
//routes
app.use("/api/register", applicationRoutes);
//Gestion des erreurs
app.use(notFound);
app.use(globalErrHandler);
