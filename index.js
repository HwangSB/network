const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const uploadDirectory = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadDirectory));

app.get('/', (req, res) => {
    res.send(`
      <style>
        body {
          font-family: Arial, sans-serif;
          height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f6f6f6;
        }
  
        .card {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          width: 300px;
        }
  
        .card form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      </style>

      <div class="card">
        <h1>20194077 황상범<br>컴퓨터네트워크<br>실습 텀 과제</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
          <input type="file" name="myFile">
          <button type="submit">Upload</button>
        </form>
      </div>
    `);
  });
  

app.post('/upload', upload.single('myFile'), (req, res) => {
  res.redirect('/list');
});

app.get('/list', (req, res) => {
  fs.readdir(uploadDirectory, (err, files) => {
    if (err) {
      return res.status(500).send('Failed to read directory');
    }

    let fileList = files.map(file => `
      <li>
        <img width=300 src="uploads/${file}" />
        <br>
        ${file} 
        <form action="/delete" method="post" style="display: inline;">
          <input type="hidden" name="filename" value="${file}">
          <button type="submit">Delete</button>
        </form>
      </li>
      <br>
    `).join('');

    res.send(`
      <h2>Uploaded Files:</h2>
      <ul>
        ${fileList}
      </ul>
    `);
  });
});

app.post('/delete', express.urlencoded({ extended: true }), (req, res) => {
  const filename = req.body.filename;
  if (filename) {
    const filePath = path.join(uploadDirectory, filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).send('Failed to delete file');
      }
      res.redirect('/list');
    });
  } else {
    res.status(400).send('Bad Request: Missing filename');
  }
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
