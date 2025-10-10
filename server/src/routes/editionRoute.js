const express = require('express');
const router = express.Router();
const editionController = require('../controllers/editionController');

// Rotas CRUD de Edição por ID (Sprint 2)
// PUT /edicoes/:id
router.put('/:id', editionController.update);
// DELETE /edicoes/:id
router.delete('/:id', editionController.delete);
// Nota: Rotas de criação e listagem de edições estão em 'eventRoutes.js'
module.exports = router;