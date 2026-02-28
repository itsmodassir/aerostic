const { Pool } = require('pg');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const pool = new Pool({ connectionString: 'postgres://zylare:aerostic_password@localhost:5432/aerostic' });

async function test() {
    try {
        const { rows: tenants } = await pool.query("SELECT id FROM tenants WHERE slug = 'system' LIMIT 1");
        if (!tenants.length) return console.log('System tenant not found');
        const tenantId = tenants[0].id;

        const { rows: users } = await pool.query("SELECT id, email, role FROM users WHERE role = 'super_admin' LIMIT 1");
        if (!users.length) return console.log('Super admin not found');
        const user = users[0];

        const token = jwt.sign({
            email: user.email,
            sub: user.id,
            id: user.id,
            role: user.role,
            tenantId: tenantId
        }, 'aerostic-super-secret-jwt-key-2024-development', { expiresIn: '1h' });

        const headers = { 'Authorization': `Bearer ${token}`, 'x-tenant-id': tenantId };

        try {
            console.log('--- Testing Analytics ---');
            const res = await axios.get('http://127.0.0.1:3000/api/v1/analytics/overview', { headers });
            console.log('Status:', res.status);
            console.log('Data:', JSON.stringify(res.data, null, 2));
        } catch (err) {
            console.log('ERROR Status:', err.response?.status);
            console.log('ERROR Data:', err.response?.data || err.message);
        }

        try {
            console.log('\n--- Testing Mailboxes ---');
            const res2 = await axios.get('http://127.0.0.1:3000/api/v1/mailboxes', { headers });
            console.log('Status:', res2.status);
            console.log('Data:', JSON.stringify(res2.data, null, 2));
        } catch (err) {
            console.log('ERROR Status:', err.response?.status);
            console.log('ERROR Data:', err.response?.data || err.message);
        }

    } catch (err) {
        console.error('Database/Script error:', err);
    } finally {
        pool.end();
    }
}

test();
