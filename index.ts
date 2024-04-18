import "dotenv/config";

// libs
import express from "express";
import bodyParser from "body-parser";

// routes
import productsRouter from "./routes/products";
import awsRouter from "./routes/awsRoutes";


// middlewares
import {bufferToJSON,handleFileUpload} from "./middleware";
import {auth, checkAuth} from "./middleware";

const PORT = process.env.PORT || 8080;
const app = express();

/* register middlewares */
app.use(bodyParser.raw({type: "application/json"}));


// app.use(auth);
// app.use(checkAuth);

/* products routes */
app.use("/api/products", bufferToJSON, productsRouter);

/* aws routes */
app.use("/api/aws", handleFileUpload, awsRouter);



app.listen(PORT, () => {
  console.log(`Listening: http://localhost:${PORT}`);
});
