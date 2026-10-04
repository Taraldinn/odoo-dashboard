import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Odoo JSON-RPC Helper for Server-Side Middleware
async function callOdooJsonRpc(baseUrl, service, method, args) {
  const url = `${baseUrl.replace(/\/+$/, '')}/jsonrpc`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { service, method, args },
      id: Math.floor(Math.random() * 1000000),
    }),
  });

  if (!response.ok) {
    throw new Error(`Odoo Server Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    const msg = data.error.data?.message || data.error.message || 'Odoo RPC Error';
    throw new Error(msg);
  }
  return data.result;
}

// Vite Plugin for Strictly GET Odoo API endpoints
function odooGetApiPlugin(env = {}) {
  return {
    name: 'odoo-get-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        if (!parsedUrl.pathname.startsWith('/api/odoo')) {
          return next();
        }

        // Only allow GET requests
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Only GET requests are allowed' }));
          return;
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const baseUrl = parsedUrl.searchParams.get('baseUrl') || env.VITE_ODOO_URL || 'https://fardin.odoo.com';
        const db = parsedUrl.searchParams.get('db') || env.VITE_ODOO_DB || 'fardin';
        const apiKey = parsedUrl.searchParams.get('apiKey') || env.VITE_ODOO_API_KEY || '';
        const login = parsedUrl.searchParams.get('login') || env.VITE_ODOO_LOGIN || 'aldinn.dev@gmail.com';

        try {
          // Version route
          if (parsedUrl.pathname === '/api/odoo/version') {
            const version = await callOdooJsonRpc(baseUrl, 'common', 'version', []);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, version }));
            return;
          }

          // Authenticate
          let uid = false;
          if (login && apiKey) {
            uid = await callOdooJsonRpc(baseUrl, 'common', 'authenticate', [db, login, apiKey, {}]);
          }

          if (!uid) {
            res.statusCode = 401;
            res.end(JSON.stringify({
              success: false,
              message: `লগইন ব্যর্থ হয়েছে। নিশ্চিত করুন ইমেইল (${login}) ও API Key সঠিক।`
            }));
            return;
          }

          // Test Connection endpoint
          if (parsedUrl.pathname === '/api/odoo/test_connection') {
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              message: `ওদু সার্ভার ও ইউজারের সাথে সফলভাবে সংযোগ স্থাপিত হয়েছে (UID: ${uid})!`,
              uid
            }));
            return;
          }

          // SALES ENDPOINT
          if (parsedUrl.pathname === '/api/odoo/sales' || parsedUrl.pathname === '/api/odoo/sale.order') {
            let records = [];
            // Try sale.order
            try {
              records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                db, uid, apiKey, 'sale.order', 'search_read',
                [[]],
                { fields: ['id', 'name', 'partner_id', 'amount_total', 'state', 'date_order'], limit: 50 }
              ]);
            } catch (se) {
              // Fallback to customer invoices in account.move
              try {
                records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                  db, uid, apiKey, 'account.move', 'search_read',
                  [[['move_type', 'in', ['out_invoice', 'out_refund']]]],
                  { fields: ['id', 'name', 'partner_id', 'amount_total', 'state', 'payment_state', 'invoice_date', 'date'], limit: 50 }
                ]);
              } catch (ie) {}
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, records }));
            return;
          }

          // PURCHASES ENDPOINT
          if (parsedUrl.pathname === '/api/odoo/purchases' || parsedUrl.pathname === '/api/odoo/purchase.order') {
            let records = [];
            try {
              records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                db, uid, apiKey, 'purchase.order', 'search_read',
                [[]],
                { fields: ['id', 'name', 'partner_id', 'amount_total', 'state', 'date_approve', 'date_order'], limit: 50 }
              ]);
            } catch (pe) {
              try {
                records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                  db, uid, apiKey, 'account.move', 'search_read',
                  [[['move_type', 'in', ['in_invoice', 'in_refund']]]],
                  { fields: ['id', 'name', 'partner_id', 'amount_total', 'state', 'payment_state', 'invoice_date', 'date'], limit: 50 }
                ]);
              } catch (ie) {}
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, records }));
            return;
          }

          // PRODUCTS / INVENTORY ENDPOINT
          if (parsedUrl.pathname === '/api/odoo/products' || parsedUrl.pathname === '/api/odoo/product.template') {
            const records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
              db, uid, apiKey, 'product.template', 'search_read',
              [[]],
              { fields: ['id', 'name', 'default_code', 'qty_available', 'list_price', 'standard_price', 'categ_id'], limit: 80 }
            ]);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, records }));
            return;
          }

          // INVOICES / ACCOUNT MOVES
          if (parsedUrl.pathname === '/api/odoo/invoices' || parsedUrl.pathname === '/api/odoo/account.move') {
            const records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
              db, uid, apiKey, 'account.move', 'search_read',
              [[]],
              { fields: ['id', 'name', 'partner_id', 'amount_total', 'amount_residual', 'move_type', 'payment_state', 'state'], limit: 60 }
            ]);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, records }));
            return;
          }

          // EMPLOYEES ENDPOINT
          if (parsedUrl.pathname === '/api/odoo/employees' || parsedUrl.pathname === '/api/odoo/hr.employee') {
            const records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
              db, uid, apiKey, 'hr.employee', 'search_read',
              [[]],
              { fields: ['id', 'name', 'job_title', 'department_id', 'work_email', 'active'], limit: 50 }
            ]);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, records }));
            return;
          }

          // ATTENDANCE ENDPOINT
          if (parsedUrl.pathname === '/api/odoo/attendance' || parsedUrl.pathname === '/api/odoo/hr.attendance') {
            let attendance = [];
            let employees = [];
            let leavesSummary = [];
            try {
              // Get employees
              employees = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                db, uid, apiKey, 'hr.employee', 'search_read',
                [[]],
                { fields: ['id', 'name', 'job_title', 'department_id', 'work_email'], limit: 50 }
              ]);

              // Get attendance records (last 30 days)
              const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
              const dateStr = thirtyDaysAgo.toISOString().slice(0, 10) + ' 00:00:00';
              attendance = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                db, uid, apiKey, 'hr.attendance', 'search_read',
                [[['check_in', '>=', dateStr]]],
                { fields: ['id', 'employee_id', 'check_in', 'check_out', 'worked_hours'], limit: 200, order: 'check_in desc' }
              ]);

              // Get time-off requests (leaves)
              try {
                const leaveFields = ['id', 'employee_id', 'date_from', 'date_to', 'state', 'number_of_days', 'name'];
                leavesSummary = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                  db, uid, apiKey, 'hr.leave', 'search_read',
                  [[['state', 'in', ['validate', 'confirm', 'validate1']]]],
                  { fields: leaveFields, limit: 30, order: 'date_from desc' }
                ]);
              } catch (le) { /* leaves optional */ }

            } catch (e) {
              // Return empty if hr module not accessible
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, employees, attendance, leaves: leavesSummary }));
            return;
          }

          // PAYMENTS ENDPOINT
          if (parsedUrl.pathname === '/api/odoo/payments' || parsedUrl.pathname === '/api/odoo/account.payment') {
            try {
              const records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                db, uid, apiKey, 'account.payment', 'search_read',
                [[]],
                { fields: ['id', 'name', 'partner_id', 'amount', 'payment_type', 'state', 'date'], limit: 60 }
              ]);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, records }));
              return;
            } catch (payErr) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, records: [], message: payErr.message }));
              return;
            }
          }

          // DELIVERIES / LOGISTICS (stock.picking)
          if (parsedUrl.pathname === '/api/odoo/deliveries' || parsedUrl.pathname === '/api/odoo/stock.picking') {
            try {
              const records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                db, uid, apiKey, 'stock.picking', 'search_read',
                [[]],
                { fields: ['id', 'name', 'origin', 'partner_id', 'state', 'scheduled_date', 'date_done', 'picking_type_id'], limit: 60 }
              ]);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, records }));
              return;
            } catch (delErr) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, records: [], message: delErr.message }));
              return;
            }
          }

          // ACTIVITIES / CHATTER (mail.activity & mail.message)
          if (parsedUrl.pathname === '/api/odoo/activities' || parsedUrl.pathname === '/api/odoo/mail.activity') {
            try {
              const records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                db, uid, apiKey, 'mail.activity', 'search_read',
                [[]],
                { fields: ['id', 'summary', 'activity_type_id', 'res_name', 'res_model', 'date_deadline', 'create_date', 'user_id'], limit: 40 }
              ]);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, records }));
              return;
            } catch (actErr) {
              try {
                const msgs = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                  db, uid, apiKey, 'mail.message', 'search_read',
                  [[['message_type', '!=', 'user_notification']]],
                  { fields: ['id', 'subject', 'body', 'date', 'author_id', 'record_name'], limit: 30 }
                ]);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, records: msgs }));
                return;
              } catch (msgErr) {
                res.statusCode = 200;
                res.end(JSON.stringify({ success: false, records: [] }));
                return;
              }
            }
          }

          // PARTNERS / CUSTOMERS ENDPOINT
          if (parsedUrl.pathname === '/api/odoo/partners' || parsedUrl.pathname === '/api/odoo/res.partner') {
            try {
              const records = await callOdooJsonRpc(baseUrl, 'object', 'execute_kw', [
                db, uid, apiKey, 'res.partner', 'search_read',
                [[]],
                { fields: ['id', 'name', 'email', 'phone', 'city', 'credit', 'debit', 'total_due', 'customer_rank'], limit: 60 }
              ]);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, records }));
              return;
            } catch (partErr) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, records: [], message: partErr.message }));
              return;
            }
          }

          res.end(JSON.stringify({ success: false, message: 'Route not found' }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, message: err.message }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...loadEnv(mode, process.cwd(), 'VITE_') };
  return {
    plugins: [react(), odooGetApiPlugin(env)],
    server: {
      port: 5174,
      host: true,
      watch: {
        usePolling: true,
        interval: 800,
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.agents/**'],
      },
    },
  };
});

