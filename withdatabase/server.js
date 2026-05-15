import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const port = 5500;

// Serve environment variables dynamically to the client
app.get('/js/env.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        window.ENV = {
            SUPABASE_URL: "${process.env.HTML_SUPABASE_URL}",
            SUPABASE_KEY: "${process.env.HTML_ANON_KEY}"
        };
    `);
});

// Serve static files
app.use(express.static(__dirname));

// Serve specific directories
app.use('/images', express.static(join(__dirname, 'images')));
app.use('/css', express.static(join(__dirname, 'css')));
app.use('/js', express.static(join(__dirname, 'js')));

// Handle all routes
app.use((req, res) => {
    res.sendFile(join(__dirname, 'home.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});