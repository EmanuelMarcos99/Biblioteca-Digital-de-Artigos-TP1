const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Rotas CRUD de Evento (Sprint 1)
router.get('/', eventController.getAll); 
router.post('/', eventController.create); 
router.put('/:id', eventController.update);
router.delete('/:id', eventController.delete);

// Rotas de Edição (vinculadas ao Evento) (Sprint 2)
router.post('/:eventId/edicoes', eventController.createEdition); 
router.get('/:eventId/edicoes', eventController.getAllEditions);

// Rotas Públicas (Home Page de Evento) (Sprint 6)
// GET /eventos/:slug
router.get('/:slug', eventController.getEventHomePage); 

// Nota: A rota GET /eventos/:slug/:ano será implementada no editionController/Routes para melhor organização
module.exports = router;