import request from "supertest";
import app from "../app.js";

describe("Test an API if it is running", () => {
  it("should return a JSON 404 response for unknown routes", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("404");
    expect(res.body.message).toBe("Endpoint tidak ditemukan");
  });
});
