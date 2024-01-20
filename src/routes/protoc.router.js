import express, { response } from 'express';
import ControllerNotification from '../Controllers/ControllerNotification.js';

const router = express.Router();
//
router.post('/notification', async (req, res) => {
     return res.send(await ControllerNotification.getNotication(req, res));
});
//
const data = [];
// criação de rota que será acessada utilizando o método HTTP GET/
// http://localhost:9000/

router.get('/api', (req, res) => {
     return res.json(data); 
     res.send(header('Content-Type: application/json'));
    });

export default router;