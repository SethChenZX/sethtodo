const MONGODB_DATA_API_KEY = import.meta.env.VITE_MONGODB_DATA_API_KEY || 'YOUR_DATA_API_KEY';
const MONGODB_DATA_API_URL = import.meta.env.VITE_MONGODB_DATA_API_URL || 'https://data.mongodb-api.com';
const CLUSTER_NAME = import.meta.env.VITE_MONGODB_CLUSTER_NAME || 'ClusterTodolist';
const APP_NAME = import.meta.env.VITE_MONGODB_APP_NAME || 'ClusterTodolist';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'api-key': MONGODB_DATA_API_KEY,
  'Authorization': `Bearer ${localStorage.getItem('firebase_token') || ''}`
});

export const getApiUrl = () => {
  return `${MONGODB_DATA_API_URL}/${CLUSTER_NAME}`;
};

export const dataApi = {
  async findOne({ database, collection, filter }) {
    const res = await fetch(`${getApiUrl()}/action/findOne`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ database, collection, filter })
    });
    return res.json();
  },

  async find({ database, collection, filter = {}, sort = { _id: -1 }, limit = 100 }) {
    const res = await fetch(`${getApiUrl()}/action/find`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ database, collection, filter, sort, limit })
    });
    return res.json();
  },

  async insertOne({ database, collection, document }) {
    const res = await fetch(`${getApiUrl()}/action/insertOne`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ database, collection, document })
    });
    return res.json();
  },

  async updateOne({ database, collection, filter, update }) {
    const res = await fetch(`${getApiUrl()}/action/updateOne`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ database, collection, filter, update })
    });
    return res.json();
  },

  async deleteOne({ database, collection, filter }) {
    const res = await fetch(`${getApiUrl()}/action/deleteOne`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ database, collection, filter })
    });
    return res.json();
  },

  async aggregate({ database, collection, pipeline }) {
    const res = await fetch(`${getApiUrl()}/action/aggregate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ database, collection, pipeline })
    });
    return res.json();
  }
};

const DB_NAME = 'todoapp';

export const userCollection = {
  findByFirebaseUid: async (firebaseUid) => {
    const result = await dataApi.findOne({
      database: DB_NAME,
      collection: 'users',
      filter: { firebaseUid }
    });
    return result.document;
  },

  create: async (userData) => {
    const result = await dataApi.insertOne({
      database: DB_NAME,
      collection: 'users',
      document: {
        ...userData,
        createdAt: new Date().toISOString()
      }
    });
    return result;
  },

  update: async (firebaseUid, update) => {
    const result = await dataApi.updateOne({
      database: DB_NAME,
      collection: 'users',
      filter: { firebaseUid },
      update: { $set: update }
    });
    return result;
  },

  findAll: async () => {
    const result = await dataApi.find({
      database: DB_NAME,
      collection: 'users',
      sort: { createdAt: -1 }
    });
    return result.documents || [];
  }
};

export const todoCollection = {
  findByUserId: async (userId) => {
    const result = await dataApi.find({
      database: DB_NAME,
      collection: 'todos',
      filter: { userId, isDeleted: { $ne: true } },
      sort: { createdAt: -1 }
    });
    return result.documents || [];
  },

  findAll: async () => {
    const result = await dataApi.find({
      database: DB_NAME,
      collection: 'todos',
      sort: { createdAt: -1 }
    });
    return result.documents || [];
  },

  findById: async (id) => {
    const result = await dataApi.findOne({
      database: DB_NAME,
      collection: 'todos',
      filter: { _id: { $oid: id } }
    });
    return result.document;
  },

  create: async (todo) => {
    const result = await dataApi.insertOne({
      database: DB_NAME,
      collection: 'todos',
      document: {
        ...todo,
        reminderSent: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    return result;
  },

  update: async (id, update) => {
    const result = await dataApi.updateOne({
      database: DB_NAME,
      collection: 'todos',
      filter: { _id: { $oid: id } },
      update: { $set: { ...update, updatedAt: new Date().toISOString() } }
    });
    return result;
  },

  delete: async (id) => {
    const result = await dataApi.updateOne({
      database: DB_NAME,
      collection: 'todos',
      filter: { _id: { $oid: id } },
      update: { $set: { isDeleted: true, updatedAt: new Date().toISOString() } }
    });
    return result;
  },

  restore: async (id) => {
    const result = await dataApi.updateOne({
      database: DB_NAME,
      collection: 'todos',
      filter: { _id: { $oid: id } },
      update: { $set: { isDeleted: false, updatedAt: new Date().toISOString() } }
    });
    return result;
  }
};
