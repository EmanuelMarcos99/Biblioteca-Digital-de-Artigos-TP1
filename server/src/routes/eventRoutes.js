const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Rotas CRUD de Evento (Sprint 1)
router.get('/', eventController.getAll); 
router.post('/', eventController.create); 

// --- CORREÇÃO: Adicionar a rota para buscar um evento por ID ---
router.get('/:id', eventController.getById);

router.put('/:id', eventController.update);
router.delete('/:id', eventController.delete);

// Rotas de Edição (vinculadas ao Evento) (Sprint 2)
router.post('/:eventId/editions', eventController.createEdition); 
router.get('/:eventId/editions', eventController.getAllEditions);

// Rotas Públicas (Home Page de Evento)
// --- SUGESTÃO: Mudar para '/slug/:slug' para não conflitar com '/:id' ---
router.get('/slug/:slug', eventController.getEventHomePage); 

module.exports = router;