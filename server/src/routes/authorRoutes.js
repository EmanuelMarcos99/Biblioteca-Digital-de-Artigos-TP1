const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

// Rota para a Home Page de Autor (Sprint 7)
// GET /autores/:authorName/artigos - Agrupa por ano
router.get('/:authorName/articles', authorController.getArticlesByAuthor);

module.exports = router;