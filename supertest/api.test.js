const request = require("supertest");

const api = request("https://reqres.in");

describe("reqres.in API testing", () => {
    it("GET users", async () => {
        const response = await api
            .get("/api/users?page=2")
            .set("x-api-key", "reqres-free-v1");
        expect(response.status).toBe(200)
        expect(response.type).toMatch(/json/)
        expect(response.body).toHaveProperty("data")
    })

    it('POST user', async () => {
        const response = await api
            .post("/api/users")
            .send({ name: "morpheus", job: "leader" })
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({
            name: "morpheus",
            job: "leader"
        })
    })

    it('PUT user', async () => {
        const response = await api
            .put("/api/users/2")
            .send({ name: "morpheus", job: "zion resident" })
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            name: "morpheus",
            job: "zion resident"
        })
    })

    it('PATCH update', async () => {
        const response = await api
            .patch("/api/users/2")
            .send({ name: "morpheus", job: "zion resident" })
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            name: "morpheus",
            job: "zion resident"
        })
    })

    it('DELETE update', async () => {
        const response = await api
            .delete("/api/users/2")
            .set("x-api-key", "reqres-free-v1")
        expect(response.status).toBe(204)
    })
})