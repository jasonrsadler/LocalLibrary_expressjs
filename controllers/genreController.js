var Book = require('../models/book');
var Genre = require('../models/genre');

var async = require('async');

exports.genre_list = function(req, res, next) {
    Genre.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_genres) {
        if (err) {return next(err);}
        res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
    });
};

exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
            .exec(callback);
        },
        
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
            .exec(callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('genre_detail', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books});
    });
};

exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', { title: 'Create Genre' });
};

exports.genre_create_post = function(req, res, next) {
    req.checkBody('name', 'Genre name required').notEmpty();
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
    var errors = req.validationErrors();
    
    var genre = new Genre({ name: req.body.name });
    if (errors) {
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors});
        return;
    }
    else {
        Genre.findOne({ 'name': req.body.name })
        .exec(function(err, found_genre) {
            console.log('found genre: ' + found_genre);
            if (err) { return next(err); } 
            
            if (found_genre) {
                res.redirect(found_genre.url);
            }
            else {
                genre.save(function(err) {
                    if (err) { return next(err); }
                    res.redirect(genre.url);
                });
            }
        });
    }
};

exports.genre_delete_get = function(req, res, next) {
    async.parallel({
        genres: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({'genre': req.params.id}).exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('genre_delete', {title: 'Delete Genre', genre: results.genres, genre_books: results.genre_books});
    });    
};

exports.genre_delete_post = function(req, res, next) {
    req.checkBody('genreid', 'Genre id must exist').notEmpty();

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.genreid).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({'genre': req.params.genreid}).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre_books.length > 0) {
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books});
            return;
        }
        else {
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if (err) { return next(err); }
                res.redirect('/catalog/genres');
            });
        }
    });
};

exports.genre_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('genre_form', {title:'Update Genre', genre:results.genre});
    });
};

exports.genre_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    req.checkBody('name', 'Name must not be empty').notEmpty();
    req.sanitize('name').escape();
    req.sanitize('name').trim();

    var genre = new Genre({
        name: req.body.name,
        _id:req.params.id
    });

    var errors = req.validationErrors();
    if (errors) {
        async.parallel({
            genre: function(callback) {
                Genre.find(callback);
            },
        }, function(err, results) {
            res.render('genre_form', {title:'Update Genre', genre:genre});
        });
    }
    else
    {
        Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err, thegenre) {
            if (err) { return next(err); }
            res.redirect(thegenre.url);
        });
    }
};