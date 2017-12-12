var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
    .populate('book')
    .exec(function(err, list_bookinstances) {
        if (err) {return next(err); }
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances});
    });
};

exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
        if (err) {return next(err);}
        res.render('bookinstance_detail', {title: 'Book:', bookinstance: bookinstance});
    });
};

exports.bookinstance_create_get = function(req, res, next) {
    Book.find({}, 'title')
    .exec(function(err, books) {
        if (err) { return next(err); }
        res.render('bookinstance_form', {title: 'Create BookInstance', book_list:books});
    });
};

exports.bookinstance_create_post = function(req, res, next) {
    req.checkBody('book', 'Book must be specified.').notEmpty();
    req.checkBody('imprint', 'Imprint must be specified.').notEmpty();
    req.checkBody('due_back', 'Invalid date').optional( {checkFalsy: true }).isISO8601();

    req.sanitize('book').escape();
    req.sanitize('imprint').escape();
    req.sanitize('status').escape();
    req.sanitize('book').trim();
    req.sanitize('imprint').trim();
    req.sanitize('status').trim();

    var errors = req.validationErrors();
    req.sanitize('due_back').toDate();

    var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
    });

    if (errors) {
        Book.find({}, 'title')
        .exec(function (err, books) {
            if (err) { return next(err); }
            res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, selected_book: bookinstance.book._id, errors: errors, bookinstance:bookinstance});            
        });
        return;
    }
    else {
        bookinstance.save(function(err) {
            if (err) { return next(err); }
            res.redirect(bookinstance.url);
        });
    }
};

exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};