'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');

const {TEST_MONGODB_URI} = require('../config');

const Folder = require('../models/folder');

const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API resource', function() {
  
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Folder.insertMany(seedFolders);
  });
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET endpoints', () => {

    it('should return all existing folders', () => {
      let res;
      return chai.request(app)
        .get('/api/folders')
        .then(results => {
          res = results;
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          return Folder.count();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    it('should return all folders with correct fields', () => {
      let folderHolder;
      return chai.request(app)
        .get('/api/folders')
        .then(result => {
          expect(result).to.have.status(200);
          expect(result).to.be.json;
          expect(result.body).to.be.a('array');
          expect(result.body).to.have.lengthOf.at.least(1);
          result.body.forEach(note => {
            expect(note).to.be.a('object');
            expect(note).to.include.keys(
              'id','name', 'createdAt','updatedAt'
            );
          });
          folderHolder = result.body[0];
          return Folder.findById(folderHolder.id);
        })
        .then(folder => {
          expect(folderHolder.id).to.equal(folder.id);
          expect(folderHolder.name).to.equal(folder.name);
          expect(new Date(folderHolder.createdAt)).to.eql(folder.createdAt);
          expect(new Date(folderHolder.updatedAt)).to.eql(folder.updatedAt);
        });
    });

    it('should return folder with correct id given id', () => {
      let res;
      return Folder
        .findOne()
        .then(folder => {
          res = folder;
          return chai.request(app)
            .get(`/api/folders/${res.id}`);
        })
        .then(result => {
          expect(result).to.be.status(200);
          expect(result).to.be.json;
          expect(result.body).to.be.a('object');
          expect(result.body).to.include.keys(
            'id', 'name', 'createdAt', 'updatedAt');
          expect(result.body.id).to.equal(res.id);
          expect(result.body.name).to.equal(res.name);
          return Folder.findById(res.id);
        })
        .then(folder => {
          expect(res.id).to.equal(folder.id);
          expect(res.name).to.equal(folder.name);
          expect(new Date(res.createdAt)).to.eql(folder.createdAt);
          expect(new Date(res.updatedAt)).to.eql(folder.updatedAt);
        });
    });

    it('should give a 404 not found ', () => {
      const emptyId = '990000000000000000000003';
      return chai
        .request(app)
        .get(`/api/folders/${emptyId}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should give a 400 with invalid id', () => {
      const invalidId = '1';
      return chai
        .request(app)
        .get(`/api/folders/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('POST endpoints', () => {
    it('should add a new folder', () =>{
      const newFolder = {
        name:'HollaBack'
      };
      
      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id','name', 'createdAt','updatedAt');
          expect(res.body.id).to.not.be.null;
          expect(res.body.name).to.equal(newFolder.name);
          return Folder.findById(res.body.id);
        })
        .then(folder =>{
          expect(res.body.id).to.equal(folder.id);
          expect(res.body.name).to.equal(folder.name);
          expect(new Date(res.body.createdAt)).to.eql(folder.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(folder.updatedAt);
        });
    });

    it('should return 400 for missing name', () => {
      const badNewFolder = {
        randomWords: 'Ah ah romma romma When my dog is hungry, I ask Lady Gaga'
      };

      return chai.request(app)
        .post('/api/folders')
        .send(badNewFolder)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });


  describe('PUT endpoints', () => {
    it('should update a folder with given id', () => {
      const updateFolder = {
        name: 'futuristic fusion'
      };
      let res;
      return Folder
        .findOne()
        .then(folder => {
          updateFolder.id = folder.id;
          return chai
            .request(app)
            .put(`/api/folders/${folder.id}`)
            .send(updateFolder);
        })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          return Folder.findById(updateFolder.id);
        })
        .then(folder => {
          expect(res.body.id).to.equal(folder.id);
          expect(res.body.name).to.equal(folder.name);
          expect(new Date(res.body.createdAt)).to.eql(folder.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(folder.updatedAt);
        });
    });

    it('should give a 400 with invalid id', () => {
      const invalidId = '3';
      const updateFolder = {
        name: 'futuristic fusion'
      };
      return chai
        .request(app)
        .put(`/api/folders/${invalidId}`)
        .send(updateFolder)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    describe('DELETE endpoints', () => {
      it('should delete a folder with given id', () => {
        let folderHolder;
        return Folder
          .findOne()
          .then(folder => {
            folderHolder = folder;
            return chai.request(app).delete(`/api/folders/${folder.id}`);
          })
          .then(res => {
            expect(res).to.have.status(204);
            return Folder.findById(folderHolder.id);
          })
          .then(folder => {
            expect(folder).to.be.null;
          });
  
      });
  
      it('should give a 404 not found ', () => {
        const emptyId = '990000000000000000000003';
        return chai
          .request(app)
          .delete(`/api/folders/${emptyId}`)
          .then(res => {
            expect(res).to.have.status(404);
          });
      });
  
      it('should give a 400 with invalid id', () => {
        const invalidId = '1';
        return chai
          .request(app)
          .delete(`/api/folders/${invalidId}`)
          .then(res => {
            expect(res).to.have.status(400);
          });
      });
    });
  });
});