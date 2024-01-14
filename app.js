import cron from "node-cron";
import traccar from "./src/Controllers/ControllerTaccar.js";
import dotenv from "dotenv";
dotenv.config();

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
