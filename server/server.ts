const port = process.env.PORT || 8000;

import express  from 'express';
import path from 'path';
import cors from 'cors';
import glob from 'glob';
import fs from "fs";

try {
  express()
    .use(cors())
    .post('/echo', (req, res) => {
      res.json({"echo": req.method})
    })
    .get('/index.json', async (req, res) => {
      glob("dist/**/*.js", (err, result) => {
        const modifiedDates = result.map(x => new Date(fs.statSync(x).mtime).getTime());
        const lastChange = Math.max(...modifiedDates);
        res.json({
            lastChange: lastChange,
            lastChangeString: new Date(lastChange),
            fileList: result.map(x => x.replace('dist/', ''))
        });
      });
    })
    .use(express.static('dist/'))
    .use("/sources/", express.static('src/'))
    .listen(port);
  console.log(`> Read on http://localhost:${port}`);
} catch (e) {
  console.error(e.stack);
  process.exit(1);
}