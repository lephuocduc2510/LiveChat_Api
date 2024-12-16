import { AppDataSource } from "./data-source";
import express, { Express, NextFunction, Request, Response } from 'express';
import { passportVerifyAccount, passportVerifyToken } from './middlewares/passportJwt';
import passport from 'passport';
import cors from 'cors';
import http from 'http';
// import { setupSocketIO } from './services/socket-services';
import adminRoutes from './routes/admin/routes';
import userRouter from './routes/user/routes';





const { default: mongoose } = require('mongoose');



var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger2 = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var rolesRouter = require('./routes/roles');
var authRouter = require('./routes/auth');
var roomRouter = require('./routes/rooms');
var messageRouter = require('./routes/message');
var roomUserRouter = require('./routes/rooms-user');
// var userRouter = require('./routes/user/routes');






var app = express();

//Connect to TypeORM

AppDataSource.initialize().then(async () => {
  console.log('Data source was initialized');

  app.use(logger2('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  // use cors
  app.use(cors({ origin: '*' }));


 
  // Sử dụng chiến lược JWT



  // CONNECT TO MONGODB
  mongoose
    .connect('mongodb://localhost:27017/chat_real_time')
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error: any) => {
      console.log('Error connecting to MongoDB', error);
    });





  // Middleware
  app.use(express.json());
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(logger2('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/roles', rolesRouter);
  app.use('/auth', authRouter);
  app.use('/rooms', roomRouter);
  app.use('/admin', adminRoutes);
  app.use('/user', userRouter);
  app.use('/messages', messageRouter);
  app.use('/rooms-user', roomUserRouter);
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  //Socket.io






  // catch 404 and forward to error handler
  app.use(function (req: Request, res: Response, next: any) {
    next(createError(404));
  });

  // error handler
  app.use(function (err: any, req: any, res: any, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
});
module.exports = app;
