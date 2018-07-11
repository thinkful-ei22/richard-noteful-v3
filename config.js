'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://user1:ASDF1234@ds151180.mlab.com:51180/noteful-v3',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/noteful-test'
};
