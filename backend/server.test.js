/**
 * Tests basiques du backend SafeZone
 *
 * Fichier :
 * backend/server.test.js
 *
 * Installer :
 * npm install --save-dev jest supertest
 */

const request = require('supertest');
const app = require('./server');

describe("API Backend SafeZone", () => {

  test("GET /api/rapport répond avec succès", async () => {

    const res = await request(app).get("/api/rapport");

    expect(res.statusCode).toBe(200);

  });

  test("GET /api/rapport renvoie les types de risques", async () => {

    const res = await request(app).get("/api/rapport");

    expect(res.body).toHaveProperty("typesRisques");

    expect(Array.isArray(res.body.typesRisques)).toBe(true);

  });

  test("Une route inexistante renvoie 404", async () => {

    const res = await request(app).get("/route-qui-nexiste-pas");

    expect(res.statusCode).toBe(404);

  });
module.exports = app;
});