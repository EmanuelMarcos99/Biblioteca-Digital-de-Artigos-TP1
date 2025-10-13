require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://seu-frontend.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

require('dotenv').config();

const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');
const authorRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const editionRoutes = require('./routes/editionRoutes');

app.use('/api/edition', editionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/edition', editionRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});