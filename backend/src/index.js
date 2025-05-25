import http from 'http';
import { connect } from './utils/mongodb.js';
import { createRoles } from './handleRoutes/stuff.js';
import { login, register, logout } from './handleRoutes/auth.js';
import { createServiceRequest, sendToMaster, updateService, getAllServices, updateServiceStatus, completeService } from './handleRoutes/service.js';
import {createComponent,getAllComponents,} from './handleRoutes/components.js';
import {getAllUsers, getAuthUser, partialUpdateUser} from "./handleRoutes/users.js"
import { getLocationStats, getRequestStats, getVisitorStats } from './handleRoutes/stats.js';


const server = http.createServer(async (req, res) => {
  const { url, method } = req;
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); 
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


  if (method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (url === '/auth/register' && method === 'POST') register(req, res);
  else if (url === '/auth/login' && method === 'POST') login(req, res);
  else if (url === '/auth/logout' && method === 'POST') logout(req, res);
  else if (url === '/service/create' && method === 'POST') createServiceRequest(req, res);
  else if (url === '/auth/current-user' && method === 'GET') getAuthUser(req, res);
  else if (url === "/stuff/create") createRoles(req, res);
  else if (url === "/users" && method === "GET") getAllUsers(req, res);
  else if (url === "/users-profile" && method === "PUT") partialUpdateUser(req, res);
  else if (url.startsWith('/service/send') && method === 'POST') sendToMaster(req, res, url);
  else if (url === '/service-request' && method === 'GET') getAllServices(req, res);
  else if (url === '/service-request/update' && method === 'PUT') updateService(req, res);
  else if (url === '/service-request/complete' && method === 'PUT') completeService(req, res);
  else if (url ==="/service-request/status/update" && method === 'PUT')updateServiceStatus(req, res)
  else if (url === '/components' && method === 'POST') createComponent(req, res)
  else if (url === '/components' && method === 'GET') getAllComponents(req, res);
  else if (url === '/stats/visitors' && method === 'GET') getVisitorStats(req, res);
  else if (url === '/stats/locations' && method === 'GET') getLocationStats(req, res);
  else if (url === '/stats/requests' && method === 'GET') getRequestStats(req, res);
 
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

connect().then(() => {
  server.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
  });
});