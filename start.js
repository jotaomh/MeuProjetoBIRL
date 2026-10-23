#!/usr/bin/env node
const express = require('express');
const { birlToJs } = require('birl-js');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/run', (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.json({ success: false, error: 'Nenhum código BIRL fornecido' });
    }
    
    const jsCode = birlToJs(code);
    let output = [];
    const originalLog = console.log;
    console.log = (...args) => {
      output.push(args.join(' '));
    };
    
    try {
      eval(jsCode);
    } finally {
      console.log = originalLog;
    }
    
    res.json({ success: true, output: output.join('\n'), jsCode });
  } catch (err) {
    res.json({ success: false, error: err.message, stack: err.stack });
  }
});

app.get('/examples', (req, res) => {
  const examplesDir = path.join(__dirname, 'node_modules/birl-js/examples');
  try {
    const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.BIRL'));
    const examples = files.map(f => {
      const content = fs.readFileSync(path.join(examplesDir, f), 'utf8');
      return { name: f, content };
    });
    res.json(examples);
  } catch (err) {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`BIRL Interface rodando em http://localhost:${PORT}`);
});
