const url = 'localhost:32772/db'; // Connection URL
const db = require('monk')(url);

const collection = db.get('test')

collection.insert([{a: 1}, {a: 2}, {a: 3}])
  .then((docs) => {
    // docs contains the documents inserted with added **_id** fields
    // Inserted 3 documents into the document collection
    console.log('insert result is', docs);
  }).catch((err) => {
  console.log('err is', err);
}).then(() => db.close())