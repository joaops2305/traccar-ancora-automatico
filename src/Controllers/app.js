import cron from "node-cron";

const teste = cron.schedule('*/2 * * * *', () => {
    console.log('running a task every two minutes');
});

teste.start();