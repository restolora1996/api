const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const { Server } = require('socket.io');
const mongoAdapter = require('socket.io-adapter-mongo');
const { mongoConnectionString } = require('./config');
const mongoose = require('mongoose');
const app = express();
const path = require('path');

var server = http.createServer(app);
const io = new Server(server,{
	cors: { 
		origin: 'http://localhost:3000',
		methods: ["GET","POST","PUT","DELETE"]
	}
});

io.on('connection', socket => {
	socket.on('sendData', (data) => {
		socket.broadcast.emit("receiveData", data);
	});
});

// io.adapter(mongoAdapter(`${mongoConnectionString.cluster}`));

// middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true, parameterLimit: 10000, limit: 1024 * 1024 * 50 }));

// headers to read FormData
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	next();
});

// routes
app.use('/', require('./routes/index'));
const usersRoutes = require('./routes/Users');
app.use('/users', usersRoutes);
const api = require('./routes/api');
const { send } = require('process');
app.use('/api', api);

// connection
mongoose.Promise = Promise;
mongoose.connect(
	`${mongoConnectionString.development}/portpolio?retryWrites=true&w=majority`,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
		// useFindAndModify: false
	},
	err => (err ? console.log('Connection error', err) : console.log('connected'))
);

// for deployment purposes
// app.use(express.static(path.join(__dirname, '/client')));
// app.get('*', (req, res) => {
// 	req.sendFile(path.resolve(__dirname, '/client/build', 'index.html'));
// });

// api
const port = process.env.PORT || 8080;
server.listen(port, () => console.log('Express server is running at port', port));
