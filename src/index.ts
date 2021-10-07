import express from "express";
import path from 'path';
import fs from 'fs'
import multer from "multer";
import { Readable } from "stream";
import parse from "csv-parse";
import transform from 'stream-transform';
import { Aggregator } from "./ts/Aggregator";
import { validators } from "./ts/validators";

const upload = multer({storage: multer.memoryStorage()});

const app = express();

app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/test', (req, res) => {
	res.send('still!')
})

app.post('/upload', upload.single('csvInput'), (req, res, next) => {
	const {body, file} = req;

	console.log(body)

	const aggregator = new Aggregator(body, validators);

	const parser = parse({delimiter: ',', columns: true});

	parser.on('readable', () => {
		let record;
		while(record = parser.read()){
			aggregator.ingest(record);
		}
	})

	parser.on('end', () => {
		res.json(aggregator.report())
	})

	parser.on('error', (e) => {
		console.error(e);
		res.status(500).send(e)
	})

	const readStream = Readable.from(file.buffer);

	readStream.pipe(parser)
})

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log(
        `App is running at http://localhost:${PORT} in ${process.env.NODE_ENV} mode`
    );
    console.log("  Press CTRL-C to stop\n");
});

export default server;