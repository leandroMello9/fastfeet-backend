import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/Multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import SessionMobile from './app/controllers/SessionMobile';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';
import OrderProcessController from './app/controllers/OrderProcessController';
import DeliverymanProblem from './app/controllers/DeliverymanProblem';
import WithdrawController from './app/controllers/WithdrawController';
import auth from './app/middlewares/auth';

const routes = new Router();
const uploads = multer(multerConfig);
routes.get('/users', UserController.index);
routes.post('/users', UserController.store);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.delete);
routes.post('/sessions', SessionController.store);
routes.post('/sessionsId', SessionMobile.store);
// Toda rota abaixo ira passar pelo middleware auth primeiro
routes.use(auth);
routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);
routes.post('/files', uploads.single('file'), FileController.store);
routes.get('/deliveryman', DeliverymanController.index);
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);
routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);
routes.get('/deliveryman/:id/deliveries', OrderProcessController.show);
routes.put('/deliveryman/:id/:order_id', OrderProcessController.update);
routes.put('/withdraw/:deliveryman_id/:order_id', WithdrawController.update);

routes.post('/delivery/problems', DeliverymanProblem.store);
routes.get('/delivery/:id/problems', DeliverymanProblem.show);

routes.delete('/delivery/:id/cancel', DeliverymanProblem.delete);

export default routes;
