import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../server/app.js'

describe('API server', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('POST /api/chat refuses disallowed content', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'jelq routine' })
    expect(res.status).toBe(200)
    expect(res.body?.safety?.refused).toBe(true)
  })
})

