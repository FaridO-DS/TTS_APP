import express from 'express';
import cookieParser from "cookie-parser";
import path from "path";
import cors from 'cors';

import authRoutes from './routes/auth.route.js'
import ttsRoutes from './routes/tts.route.js'

import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';

const __dirname = path.resolve();
const app = express();
const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "4mb" })); // req.body
app.use(cors({origin: ENV.CLIENT_URL, credentials: true})); // req.headers
app.use(cookieParser()); // req.cookies

app.use('/auth', authRoutes)
app.use('/api/tts', ttsRoutes)

// Make ready for deployment
if (ENV.NODE_ENV === "production") {
    const disPath = path.join(process.cwd(),"dist");
    app.use(express.static(disPath));
    app.get("*", (_, res) => {
        res.sendFile(path.join(disPath, "index.html"), (err) => {
	  if (err) {
		console.error("Critical error when sending index.html :", err);
		res.status(500).send("Check dist directory location.");
   	  }
	});
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
    connectDB();
})


