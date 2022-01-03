require('dotenv').config();
const express = require("express");
const ptp = require("pdf-to-printer");
const fs = require("fs");
const path = require("path");
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, access, token'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE'
    );
    next();
});

app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json({ limit: '10mb' }));

const MESSAGE_401 = 'Unauthorized request',
      MESSAGE_TOKEN = 'Invalid Token';

const error401 = (res, message) => {
    return res.status(401).json({ 
      ok: false,
      error: 401,
      message
    });
}

app.post('', async(req, res) => {
    //console.log('Is working')

    if (!req.headers.access) return error401(res, MESSAGE_401);
    const token = req.headers.access.split(' ')[1];
    if (token === null) return error401(res, MESSAGE_401);
    jwt.verify(token, process.env.SEED, (err) => {      
      if (err) return error401(res, MESSAGE_TOKEN)
    });

        const options = {
            win32: ['-print-settings "noscale']  
        };
        /* if (req.query.printer) {
            options.printer = req.query.printer;
            console.log(options)
        } */
        //const tmpFilePath = path.join(`./pdf/aaa.pdf`);

        const tmpFilePath = path.join(`./pdf/${req.body.id || Math.random().toString(36).substr(7)}.pdf`);
        fs.writeFileSync(tmpFilePath, req.body.pdf, 'base64');
        await ptp.print(tmpFilePath, options);
        fs.unlinkSync(tmpFilePath);
  
    res.status(204);
    res.send();
});

//ptp.getDefaultPrinter().then(console.log)

app.listen(port, () => {
    console.log(`PDF Printing Service listening on port ${port}`)
});