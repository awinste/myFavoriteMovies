/* eslint-disable */
const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('winston');
const mongoose = require('mongoose');
const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const axios = require('axios')
const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

require('dotenv').config();

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

mongoose.connect(`mongodb://user:${process.env.DBPASSWORD}@ds247688.mlab.com:47688/rainydaymovies`);

const Movies = mongoose.model('movies', {movieID: Number, title: String, year: Number, genres: Array});


app.get('/movies', (req, res) => {
    mongoose.model('movies').find({}, (err, movies) => {
        if(err){
            console.error(err);
        }
        res.status(200).send(movies);
    });
});

app.get('/allGenres', (req,res) => {
    let allGenres = [];
    mongoose.model('movies').find({}, (err, movies) => {
        if(err){
            console.error(err);
        }else{
            for(let i=0; i<movies.length; i++){
                for(let j=0; j<movies[i].genres.length; j++){
                    if(!allGenres.includes(movies[i].genres[j])){
                        allGenres.push(movies[i].genres[j]);
                    }
                }
            }
        }
        allGenres.sort();
        res.status(200).send(allGenres)
    })
});

app.post('/addMovie', (req, res) => {
    const movie = new Movies({
        movieID: req.body.movieID, 
        title: req.body.title, 
        year: req.body.year, 
        genres: req.body.genres
    });
    movie.save(err => {
        if(err){
            console.error(err);
        }else{
            res.status(201).send('movie added successfully');
        }
    })
});

app.post('/showGenre', (req, res) => {
    let specificGenre = [];
    mongoose.model('movies').find({}, (err, movies) => {
        if(err){
            console.error(err);
        }else{
            for(let i=0; i<movies.length; i++){
                if(movies[i].genres.includes(req.body.genre)){
                    specificGenre.push(movies[i]);
                }
            }
            res.status(201).send(specificGenre);
        }
    })
});

app.put('/updateMovie', (req, res) => {
    mongoose.model('movies').findOne({_id: req.body.id}, (error, movie) => {
        if(error){
            console.error(error);
        }
        movie.title = req.body.title;
        movie.year = req.body.year;
        movie.genres = req.body.genres;
        movie.save((error) => {
            if(error){
                console.error(error);
            }
            res.status(200).send('movie successfully updated');
        })
    });
});

app.delete('/deleteMovie', (req, res) => {
    Movies.findOneAndRemove({movieID: req.body.movieID}, error => {
        if(error){
            console.error(error);
        }else{
            res.status(202).send('Entry successfully deleted');
        }
    })
});

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;   
