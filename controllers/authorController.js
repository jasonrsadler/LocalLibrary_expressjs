var Book = require('../models/book');
var async = require('async');
var Author = require('../models/author');


//Display list of all Authors
exports.author_list = function(req, res, next) {
    Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function(err, list_authors) {
        if (err) {return next(err); }
        res.render('author_list', { title: 'Author List', author_list: list_authors });
    })
};

//Display detail page for a specific Author
exports.author_detail = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
            .exec(callback);
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id }, 'title summary')
            .exec(callback)
        },
        
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('author_detail', {title: 'Author Detail', author: results.author, author_books: results.authors_books });
    });
};

//Display Author create form on GET
exports.author_create_get = function(req, res, next) {
    res.render('author_form', { title: 'Create Author'});
};

exports.author_create_post = function(req, res, next) {
    req.checkBody('first_name', 'First name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlphanumeric();
    req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isISO8601();
    req.checkBody('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isISO8601();
    
    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').trim();
    
    var errors = req.validationErrors();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();
    
    var author = new Author(
        {
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        }
    );
    
    if (errors) {
        res.render('author_form', { title: 'Create Author', author: author, errors: errors});
        return;
    }
    else {
        author.save(function (err) {
            if (err) { return next(err);}
            res.redirect(author.url);
        });
    }
};

exports.author_delete_get = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback);
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id}).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books});
    });
};

exports.author_delete_post = function(req, res, next) {
    req.checkBody('authorid', 'Author id must exist').notEmpty();
    
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.authorid).exec(callback);
        },
        authors_books: function(callback) {
            Author.find({ 'author': req.body.authorid }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.authors_books.length > 0) {
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books});
            return;
        }
        else {
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                console.log('deleted id: ' + req.body.authorid);
                if (err) { return next(err); }
                res.redirect('/catalog/authors');
            });
        }
    });
};

exports.author_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('author_form', {title: 'Update Author', author: results.author});
    });
};

exports.author_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    
    req.checkBody('first_name', 'First name must not be empty').notEmpty();
    req.checkBody('family_name', 'Family name must not be empty').notEmpty();
    
    req.sanitize('first_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').escape();
    req.sanitize('family_name').trim();
    req.checkBody('date_of_birth', 'Invalid Date').optional({ checkFalsy: true}).isISO8601();
    req.checkBody('date_of_death', 'Invalid Date').optional({ checkFalsy: true}).isISO8601();
    
    
    var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id:req.params.id
    });
    
    var errors = req.validationErrors();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();
    
    if (errors) { 
        async.parallel({
            authors: function(callback) {
                Author.find(callback);
            }, 
        }, function(err, results) {
            res.render('author_form', {title: 'Update Author', author: author, errors:errors});
        });        
    }    
    else {
        Author.findByIdAndUpdate(req.params.id, author, {}, function(err, theauthor) {
            if (err) { return next(err); }
            res.redirect(theauthor.url);        
        });
    }
};