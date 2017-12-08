var Author = require('../models/author');

//Display list of all Authors
exports.author_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Author List');
};

//Display detail page for a specific Author
exports.author_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Author details: ' + req.params.id);
};

//Display Author create form on GET
exports.author_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create GET');    
};

exports.author_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create POST');
};

exports.author_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete GET');
};

exports.author_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update  POST');
};