const express = require("express");
const fileUpload = require("express-fileupload");
const randomstring = require("randomstring");

const app = express();
const fs = require("fs");
const key = require("./settings.json").key;
const filePath = require("./settings.json").filePath;
const baseUrl = require("./settings.json").baseUrl;
const port = require("./settings.json").port;

let lastKnownUrl = "";

app.set('view engine', 'ejs');
app.use(fileUpload({
	limits: {fileSize: 100 * 1024 * 1024}
}));


// APIs

app.post('/upload', (req, res) => {
	if (req.headers.key !== key) return res.status(403).send("Invalid Key.");

	if (!req.files) res.status(403).send("Invalid/No File Provided.");

	const newFileName = `${randomstring.generate(12)}.${req.files.file.name.split('.')[1]}`;
	req.files.file.mv(`${filePath}/${newFileName}`).then(r => {

		lastKnownUrl = baseUrl + newFileName;

		res.status(200).send(lastKnownUrl);
	}).catch(error => {
		if(error) console.log(error);
	})

})

app.get('/:file', (req, res) => {
	if (req.params.file) {
		fs.exists(`${process.cwd()}/i/${req.params.file}`, (e) => {
			if (e) {
				res.sendFile(`${process.cwd()}/i/${req.params.file}`)
			} else {
				res.status(404).send('Not Found.')
			}
		})
	} else {
		res.status(404).redirect('https://http.cat/404')
	}
})

app.listen(port)