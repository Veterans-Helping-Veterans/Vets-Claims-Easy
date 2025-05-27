const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Data storage initialization
const DATA_FILE = 'data/claims.json';
const DATA_DIR = 'data';

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Create claims file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Load claims data
let claims = [];
try {
    const data = fs.readFileSync(DATA_FILE);
    claims = JSON.parse(data);
} catch (error) {
    console.error('Error loading claims data:', error);
}

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Routes
app.post('/api/submit-claim', async (req, res) => {
    try {
        const claim = {
            id: Date.now().toString(),
            ...req.body,
            date: new Date().toISOString(),
            status: 'new',
            files: req.body.files || []
        };

        claims.push(claim);
        fs.writeFileSync(DATA_FILE, JSON.stringify(claims, null, 2));

        res.json({ success: true, id: claim.id });
    } catch (error) {
        console.error('Error submitting claim:', error);
        res.status(500).json({ error: 'Error submitting claim' });
    }
});

app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    
    // In a real application, you would check against a database
    // For demo purposes, we're using hardcoded credentials
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/admin/claims', authenticateAdmin, (req, res) => {
    res.json(claims);
});

app.post('/api/admin/update-claim', authenticateAdmin, (req, res) => {
    try {
        const { id, status, notes } = req.body;
        const claimIndex = claims.findIndex(c => c.id === id);
        
        if (claimIndex === -1) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        claims[claimIndex] = {
            ...claims[claimIndex],
            status,
            notes,
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(DATA_FILE, JSON.stringify(claims, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating claim:', error);
        res.status(500).json({ error: 'Error updating claim' });
    }
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
