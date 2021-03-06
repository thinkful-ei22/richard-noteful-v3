'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Note = require('../models/note');


/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const {searchTerm, folderId, tagId} = req.query;
  let filter = {};
  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }
  if (folderId) {
    filter.folderId = folderId;
  }
  if (tagId) {
    filter.tags = tagId;
  }
  
  Note
    .find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const {id} = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Note
    .findById(id)
    .populate('tags')
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const {title, content, folderId, tags} = req.body;
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('Invalid `folderId` in request body');
    err.status = 400;
    return next(err);
  }

  if (tags) {
    tags.forEach(tagId => {
      if(!mongoose.Types.ObjectId.isValid(tagId)) {
        const err = new Error('Invalid `tag` id in request body');
        err.status = 400;
        return next(err);
      }
    });
  }

  const newNote = {title, content, folderId, tags};

  Note.create(newNote)
    .then(results => {
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const {id} = req.params;
  const {title, content, folderId, tags} = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('Invalid `folderId` in request body');
    err.status = 400;
    return next(err);
  }

  if (tags) {
    tags.forEach(tagId => {
      if(!mongoose.Types.ObjectId.isValid(tagId)) {
        const err = new Error('Invalid `tag` id in request body');
        err.status = 400;
        return next(err);
      }
    });
  }

  const updateNote = {title, content, folderId, tags};

  Note
    .findByIdAndUpdate(id, updateNote, {new:true})
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const {id} = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note
    .findByIdAndRemove(id)
    .then(results => {
      if (results) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

module.exports = router;