'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');

const {TEST_MONGODB_URI} = require('../config');

const Note = require('../models/note');

const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API resource', function() {
  
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Note.insertMany(seedNotes);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET endpoints', () => {

    it('should return all existing notes', () => {
      let res;
      return chai.request(app)
        .get('/api/notes')
        .then(results => {
          res = results;
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          return Note.count();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    it('should return all notes with correct fields', () => {
      let noteHolder;
      return chai.request(app)
        .get('/api/notes')
        .then(result => {
          expect(result).to.have.status(200);
          expect(result).to.be.json;
          expect(result.body).to.be.a('array');
          expect(result.body).to.have.lengthOf.at.least(1);
          result.body.forEach(note => {
            expect(note).to.be.a('object');
            expect(note).to.include.keys(
              'id','title','content','createdAt','updatedAt'
            );
          });
          noteHolder = result.body[0];
          return Note.findById(noteHolder.id);
        })
        .then(note => {
          expect(noteHolder.id).to.equal(note.id);
          expect(noteHolder.title).to.equal(note.title);
          expect(noteHolder.content).to.equal(note.content);
          expect(new Date(noteHolder.createdAt)).to.eql(note.createdAt);
          expect(new Date(noteHolder.updatedAt)).to.eql(note.updatedAt);
        });
    });

    it('should return note with given `searchTerm` query', () => {
      const searchTerm = 'gaga';
      return chai.request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`)
        .then(result => {
          expect(result).to.have.status(200);
          expect(result).to.be.json;
          expect(result.body).to.be.a('array');
        });
    });

    it('should return note with correct id given id', () => {
      let res;
      return Note
        .findOne()
        .then(note => {
          res = note;
          return chai.request(app)
            .get(`/api/notes/${res.id}`);
        })
        .then(result => {
          expect(result).to.be.status(200);
          expect(result).to.be.json;
          expect(result.body).to.be.a('object');
          expect(result.body).to.include.keys(
            'id', 'title', 'content', 'createdAt', 'updatedAt');
          expect(result.body.id).to.equal(res.id);
          expect(result.body.title).to.equal(res.title);
          expect(result.body.content).to.equal(res.content);
          return Note.findById(res.id);
        })
        .then(note => {
          expect(res.id).to.equal(note.id);
          expect(res.title).to.equal(note.title);
          expect(res.content).to.equal(note.content);
          expect(new Date(res.createdAt)).to.eql(note.createdAt);
          expect(new Date(res.updatedAt)).to.eql(note.updatedAt);
        });
    });

    it('should give a 404 not found ', () => {
      const emptyId = '990000000000000000000003';
      return chai
        .request(app)
        .get(`/api/notes/${emptyId}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should give a 400 with invalid id', () => {
      const invalidId = '1';
      return chai
        .request(app)
        .get(`/api/notes/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('POST endpoints', () => {
    it('should add a new note', () =>{
      const newNote = {
        title:'When my dog is hungry, I ask Lady Gaga',
        content: 'Ah ah romma romma'
      };
      
      let res;
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id','title','content', 'createdAt','updatedAt');
          expect(res.body.id).to.not.be.null;
          expect(res.body.title).to.equal(newNote.title);
          expect(res.body.content).to.equal(newNote.content);
          return Note.findById(res.body.id);
        })
        .then(note =>{
          expect(res.body.id).to.equal(note.id);
          expect(res.body.title).to.equal(note.title);
          expect(res.body.content).to.equal(note.content);
          expect(new Date(res.body.createdAt)).to.eql(note.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(note.updatedAt);
        });
    });

    it('should return 400 for missing title', () => {
      const badNewNote = {
        content: 'Ah ah romma romma When my dog is hungry, I ask Lady Gaga'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(badNewNote)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('PUT endpoints', () => {
    it('should update a note with given id', () => {
      const updateNote = {
        title: 'fofofofofofofof',
        content: 'futuristic fusion'
      };
      let res;
      return Note
        .findOne()
        .then(note => {
          updateNote.id = note.id;
          return chai
            .request(app)
            .put(`/api/notes/${note.id}`)
            .send(updateNote);
        })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          return Note.findById(updateNote.id);
        })
        .then(note => {
          expect(res.body.id).to.equal(note.id);
          expect(res.body.title).to.equal(note.title);
          expect(res.body.content).to.equal(note.content);
          expect(new Date(res.body.createdAt)).to.eql(note.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(note.updatedAt);
        });
    });

    it('should give a 400 with invalid id', () => {
      const invalidId = '1';
      return chai
        .request(app)
        .put(`/api/notes/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('DELETE endpoints', () => {
    it('should delete a note with given id', () => {
      let noteHolder;
      return Note
        .findOne()
        .then(note => {
          noteHolder = note;
          return chai.request(app).delete(`/api/notes/${note.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Note.findById(noteHolder.id);
        })
        .then(note => {
          expect(note).to.be.null;
        });

    });

    it('should give a 404 not found ', () => {
      const emptyId = '990000000000000000000003';
      return chai
        .request(app)
        .delete(`/api/notes/${emptyId}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should give a 400 with invalid id', () => {
      const invalidId = '1';
      return chai
        .request(app)
        .delete(`/api/notes/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });
});