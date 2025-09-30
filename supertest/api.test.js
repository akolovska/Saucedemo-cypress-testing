const request = require("supertest");

const api = request("https://reqres.in");
describe("reqres.in API testing", () => {
    it('POST create user', async () => {
        const response = await api
            .post("/api/users")
            .send({name: "Ana", job: "tester"})
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("id")
    })

    it('POST create user', async () => {
        const response = await api
            .post("/api/users")
            .send({name: "Bojana", job: "tester"})
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("createdAt")
    })

    it('POST register', async () => {
        const response = await api
            .post("/api/register")
            .send({email: "eve.holt@reqres.in", password: "pistol"})
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("id")
    })

    it('POST login', async () => {
        const response = await api
            .post("/api/register")
            .send({email: "eve.holt@reqres.in", password: "cityslicka"})
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            token: "QpwL5tke4Pnpja7X4"
        })
    })

    it('POST login unsuccessful', async () => {
        const response = await api
            .post("/api/register")
            .send({email: "bojana@gmail.com", password: "bojana"})
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error")
    })

    it("GET users", async () => {
        const response = await api
            .get("/api/users?page=1")
            .set("x-api-key", "reqres-free-v1");
        expect(response.status).toBe(200)
        expect(response.type).toMatch(/json/)
        expect(response.body).toHaveProperty("data")
    })

    it("GET one user", async () => {
        const response = await api
            .get("/api/users/5")
            .set("x-api-key", "reqres-free-v1");
        expect(response.status).toBe(200)
        expect(response.type).toMatch(/json/)
        expect(response.body.hasOwnProperty("id"))
    })

    it("GET not found", async () => {
        const response = await api
            .get("/api/unknown/23")
            .set("x-api-key", "reqres-free-v1");
        expect(response.status).toBe(404)
        expect(response.body).toMatchObject({

        })
    })

    it('PUT update user', async () => {
        const response = await api
            .put("/api/users/0")
            .send({name: "ana", job: "tester"})
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(200)
        expect(response.body.name).toEqual("ana")
        expect(response.body).toHaveProperty("updatedAt")
    })

    it('PATCH update', async () => {
        const response = await api
            .patch("/api/users/2")
            .send({name: "ana", job: "tester"})
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            name: "ana",
            job: "tester"
        })
        expect(response.body.hasOwnProperty("updatedAt"))
    })

    it('DELETE update', async () => {
        const response = await api
            .delete("/api/users/2")
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(204)
    })
})