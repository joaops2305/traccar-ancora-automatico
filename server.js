import express from 'express';
import cron from "node-cron";
import path from 'path';
import cors from 'cors';
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

import traccar from "./src/Controllers/ControllerTaccar.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
import userRoute from './src/routes/protoc.router.js';

app.use(cors());
app.use(bodyParser.json({ limit: '35mb', extended: true, }));
app.use(
     bodyParser.urlencoded({
          extended: true,
          limit: '35mb',
          parameterLimit: 50000,
     }),
);
app.use(cookieParser());

app.use(express.static('public'));

app.use('/', userRoute);

app.listen(process.env.PORT, () => {
     console.log(`Servidor Online Porta ${process.env.PORT}`);
});

const horaStat = process.env.HORAIO_ABERTURA.split(':');
const horaStop = process.env.HORAIO_FECHAMENTO.split(':');

//Start Ancora
cron.schedule(`2 ${horaStat[1]} ${horaStat[0]} * * *`, () => {

    traccar.StartGrupos().then((res) => {
        console.log("Start Ancora");
    });

});

//Stop Ancora
cron.schedule(`2 ${horaStop[1]} ${horaStop[0]} * * *`, () => {

    traccar.StopGrupos().then((res) => {
        console.log("Stop Ancora");
    });

});
