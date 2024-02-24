const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ObjectId, MongoClient } = require('mongodb');

const app = express();

const client = new MongoClient('mongodb://root:example@localhost:27017?authSource=admin');

app.use(cors());
app.use(bodyParser.json());

app.use(async (req, res, next) => {
  await client.connect();
  const db = client.db('todos');

  req.db = db;

  next();
});

app.get('/healthcheck', async (req, res) => {
  res.send();
});

app.get('/api/todos', async (req, res) => {
  const todoDocs = await req.db.collection('todos').find({}).toArray();

  res.send(todoDocs);
});

app.post('/api/todos', async (req, res) => {
  console.log({ body: req.body });
  const todos = req.db.collection('todos');
  await todos.insertOne({ name: req.body.name, done: false });

  res.send();
});

app.delete('/api/todos/:id', async (req, res) => {
  console.log({ body: req.params });

  const todos = req.db.collection('todos');
  await todos.deleteOne({ _id: new ObjectId(req.params.id) });

  res.send();
});

app.post('/api/todos/:id', async (req, res) => {
  console.log({ body: req.params });

  const todos = req.db.collection('todos');
  await todos.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { done: true }});

  res.send();
});

app.listen(2000);