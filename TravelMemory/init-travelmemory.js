// init-travelmemory.js
db = new Mongo().getDB("travelmemory");
db.createCollection("initCollection");
db.initCollection.insertOne({ initialized: true });

