// Simple test to check what routes are registered
const express = require('express');
const app = require('./backend/src/app');

// Get all registered routes
function getRoutes(app) {
  const routes = [];
  
  app._router.stack.forEach(function(middleware) {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(function(handler) {
        if (handler.route) {
          const basePath = middleware.regexp.source
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace(/\$.*/, '');
          
          routes.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: basePath + handler.route.path
          });
        }
      });
    }
  });
  
  return routes;
}

console.log('=== REGISTERED ROUTES ===');
try {
  const routes = getRoutes(app);
  routes.forEach(route => {
    console.log(`${route.method} ${route.path}`);
  });
  
  // Check specifically for business routes
  const businessRoutes = routes.filter(route => route.path.includes('/api/business'));
  console.log('\n=== BUSINESS ROUTES ===');
  businessRoutes.forEach(route => {
    console.log(`${route.method} ${route.path}`);
  });
  
  if (businessRoutes.length === 0) {
    console.log('❌ NO BUSINESS ROUTES FOUND!');
    console.log('This indicates the business routes are not being registered properly.');
  }
  
} catch (error) {
  console.error('Error checking routes:', error);
}
