const fs = require('fs');
const path = require('path');
const request = require('supertest');

const testDbFile = path.join(__dirname, 'gyminfinity.test.db');
process.env.DB_FILE = testDbFile;
process.env.NODE_ENV = 'test';
process.env.ADMIN_PASSWORD = 'GYMADMIN2026';

const { app, db } = require('../server');

const extractCsrfToken = (html) => {
  const match = html.match(/name="csrfToken"\s+value="([^"]+)"/);
  if (!match) {
    throw new Error('No se encontro csrfToken en la pagina.');
  }

  return match[1];
};

beforeAll(async () => {
  await db.ready;
});

afterAll(async () => {
  await db.close();

  if (fs.existsSync(testDbFile)) {
    fs.unlinkSync(testDbFile);
  }
});

describe('Gyminfinity app', () => {
  test('muestra la pagina principal', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Gyminfinity');
  });

  test('permite iniciar sesion como administrador', async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get('/admin-login').expect(200);
    const csrfToken = extractCsrfToken(loginPage.text);

    await agent
      .post('/admin-login')
      .type('form')
      .send({
        csrfToken,
        password: 'GYMADMIN2026',
        username: 'admin'
      })
      .expect(302)
      .expect('Location', '/admin');

    const adminPage = await agent.get('/admin').expect(200);
    expect(adminPage.text).toContain('Facturacion');
  });

  test('registra un cliente y genera factura con tarjeta de credito', async () => {
    const agent = request.agent(app);
    const email = `cliente.${Date.now()}@example.com`;

    const homePage = await agent.get('/').expect(200);
    const signupCsrf = extractCsrfToken(homePage.text);

    await agent
      .post('/signup')
      .type('form')
      .send({
        age: '29',
        csrfToken: signupCsrf,
        email,
        goal: 'Perder peso',
        height: '175',
        name: 'Cliente Prueba',
        phone: '3001234567',
        plan: 'Fitness Pro',
        weight: '78'
      })
      .expect(302)
      .expect('Location', '/client');

    const clientPage = await agent.get('/client').expect(200);
    const orderCsrf = extractCsrfToken(clientPage.text);

    const orderResponse = await agent
      .post('/order')
      .type('form')
      .send({
        address: 'Calle 10 # 15-20',
        billingAddress: 'Calle 10 # 15-20',
        billingDocument: '123456789',
        billingEmail: email,
        billingName: 'Cliente Prueba',
        billingPhone: '3001234567',
        cardCvv: '123',
        cardExpiry: '12/30',
        cardHolder: 'Cliente Prueba',
        cardInstallments: '3',
        cardNumber: '4111111111111111',
        csrfToken: orderCsrf,
        paymentMethod: 'card',
        productId: '1'
      })
      .expect(302);

    const order = await db.queryOne('SELECT * FROM orders WHERE billing_email = ?', [email]);

    expect(order).toEqual(expect.objectContaining({
      billing_document: '123456789',
      card_brand: 'Visa',
      card_last4: '1111',
      payment_method: 'card',
      payment_status: 'Pagado'
    }));
    expect(order.invoice_number).toMatch(/^GYM-\d{4}-\d{6}$/);
    expect(order.amount_total).toBeGreaterThan(0);
    expect(order.payment_destination.toLowerCase()).toContain('cuenta bancaria');
    expect(orderResponse.headers.location).toBe(`/invoice/${order.invoice_number}`);

    const invoicePage = await agent.get(`/invoice/${order.invoice_number}`).expect(200);
    expect(invoicePage.text).toContain('Factura de venta');
    expect(invoicePage.text).toContain('Gyminfinity Centro de Acondicionamiento Fisico');
    expect(invoicePage.text).toContain('Cliente Prueba');
  });
});
