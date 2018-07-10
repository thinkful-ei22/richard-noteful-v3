'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// Find/Search for notes using Note.find
mongoose.connect(MONGODB_URI)
  .then(() => {
    const searchTerm = /aliquam/i;
    let filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm };
      // filter.content = { $regex: searchTerm };
    }
    return Note.find({$or : [filter, {content: { $regex: searchTerm }}]}).sort({ updatedAt: 'desc' });
  })    
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// Find note by id using Note.findById
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000005';

//     return Note.findById(id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.err(`ERROR: ${err.message}`);
//     console.err(err);
//   });

// Create a new note using Note.create
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const newNote = {
//       title: 'When I my cat gets hungry, I ask Lady Gaga',
//       content: 'Rah rah ah-ah-ah! Ro mah ro-mah-mah Gaga ooh-la-la!'
//     };
//     return Note.create(newNote);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.err(`ERROR: ${err.message}`);
//     console.err(err);
//   });
// Update a note by id using Note.findByIdAndUpdate
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '5b45053944f7b222056aaa90';
//     const updateNote = {
//       title: 'When I my dog gets silly, I ask Lady Gaga',
//       content: 'Dog dog ah-ah-ah! Ro mah ro-mah-mah Gaga ooh-la-la!'
//     };
//     return Note.findByIdAndUpdate(id, updateNote, {new:true, upsert:true});
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.err(`ERROR: ${err.message}`);
//     console.err(err);
//   });
// Delete a note by id using Note.findByIdAndRemove
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '5b45053944f7b222056aaa90';
//     return Note.findByIdAndRemove(id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.err(`ERROR: ${err.message}`);
//     console.err(err);
//   });