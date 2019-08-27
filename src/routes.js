import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middleware/auth';
import ActiveDirectoryController from './app/controllers/ActiveDirectoryController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.get('/ad', ActiveDirectoryController.index);
routes.get('/ad/:cpf', ActiveDirectoryController.show);
routes.put('/ad', ActiveDirectoryController.update);


routes.put('/users', UserController.update);


routes.post('/files', upload.single('file'), (req, res) => {
  return res.json(req.file);
});

export default routes;
