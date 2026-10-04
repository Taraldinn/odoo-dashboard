import os
import unittest
from unittest.mock import patch, MagicMock

class TestOdooService(unittest.TestCase):
    def setUp(self):
        self.env_patcher = patch.dict(os.environ, {
            "ODOO_URL": "https://mime.odoo.com",
            "ODOO_DB": "mime",
            "ODOO_MCP_KEY": "test_mcp_key_12345"
        })
        self.env_patcher.start()

    def tearDown(self):
        self.env_patcher.stop()

    def test_init_loads_from_env(self):
        from odoo_service import OdooService
        service = OdooService()
        self.assertEqual(service.url, "https://mime.odoo.com")
        self.assertEqual(service.db, "mime")
        self.assertEqual(service.mcp_key, "test_mcp_key_12345")

    def test_init_overrides_env(self):
        from odoo_service import OdooService
        service = OdooService(url="https://custom.odoo.com", db="custom_db", mcp_key="custom_key")
        self.assertEqual(service.url, "https://custom.odoo.com")
        self.assertEqual(service.db, "custom_db")
        self.assertEqual(service.mcp_key, "custom_key")

    def test_headers_include_bearer_token(self):
        from odoo_service import OdooService
        service = OdooService()
        headers = service.get_headers()
        self.assertEqual(headers.get("Authorization"), "Bearer test_mcp_key_12345")
        self.assertEqual(headers.get("Content-Type"), "application/json")

    @patch("odoo_service.requests.post")
    def test_json_rpc_call_success(self, mock_post):
        from odoo_service import OdooService
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "result": [{"id": 10, "name": "Test Partner"}]
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        service = OdooService()
        res = service.execute_kw("res.partner", "search_read", [[["customer_rank", ">", 0]]], {"fields": ["name"]})
        self.assertEqual(res, [{"id": 10, "name": "Test Partner"}])

    @patch("odoo_service.requests.post")
    def test_json_rpc_call_error_raises_exception(self, mock_post):
        from odoo_service import OdooService, OdooRPCError
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "error": {
                "message": "Odoo Server Error",
                "data": {"message": "Access Denied"}
            }
        }
        mock_post.return_value = mock_response

        service = OdooService()
        with self.assertRaises(OdooRPCError) as ctx:
            service.execute_kw("res.partner", "search_read", [[]])
        self.assertIn("Access Denied", str(ctx.exception))

    @patch("odoo_service.requests.post")
    def test_search_read_helper(self, mock_post):
        from odoo_service import OdooService
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "result": [{"id": 1, "name": "Order 1"}]
        }
        mock_post.return_value = mock_response

        service = OdooService()
        orders = service.search_read("sale.order", domain=[["state", "=", "sale"]], fields=["name"], limit=5)
        self.assertEqual(len(orders), 1)
        self.assertEqual(orders[0]["name"], "Order 1")

    @patch("odoo_service.requests.post")
    def test_create_record_helper(self, mock_post):
        from odoo_service import OdooService
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "result": 42
        }
        mock_post.return_value = mock_response

        service = OdooService()
        new_id = service.create_record("res.partner", {"name": "New Customer"})
        self.assertEqual(new_id, 42)

    @patch("odoo_service.requests.post")
    def test_test_connection_success(self, mock_post):
        from odoo_service import OdooService
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "result": {"server_version": "19.0"}
        }
        mock_post.return_value = mock_response

        service = OdooService()
        status = service.test_connection()
        self.assertTrue(status["success"])
        self.assertEqual(status["version"]["server_version"], "19.0")

    @patch("odoo_service.requests.post")
    def test_test_connection_failure(self, mock_post):
        from odoo_service import OdooService
        mock_post.side_effect = Exception("Connection refused")

        service = OdooService()
        status = service.test_connection()
        self.assertFalse(status["success"])
        self.assertIn("Connection refused", status["error"])

    @patch("odoo_service.requests.post")
    def test_get_convenience_methods(self, mock_post):
        from odoo_service import OdooService
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "result": [{"id": 101, "name": "SO001"}]
        }
        mock_post.return_value = mock_response

        service = OdooService()
        orders = service.get_sale_orders(limit=10)
        self.assertEqual(len(orders), 1)
        self.assertEqual(orders[0]["name"], "SO001")

        payments = service.get_payments(limit=5)
        self.assertEqual(len(payments), 1)

        partners = service.get_partners(limit=5, is_customer=True)
        self.assertEqual(len(partners), 1)

    @patch("odoo_service.requests.post")
    def test_get_invoices(self, mock_post):
        from odoo_service import OdooService
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "result": [{"id": 501, "name": "INV/2026/001", "amount_total": 45000.0, "payment_state": "not_paid"}]
        }
        mock_post.return_value = mock_response

        service = OdooService()
        invoices = service.get_invoices(limit=5)
        self.assertEqual(len(invoices), 1)
        self.assertEqual(invoices[0]["name"], "INV/2026/001")
        self.assertEqual(invoices[0]["payment_state"], "not_paid")

    @patch("odoo_service.requests.post")
    def test_get_deliveries(self, mock_post):
        from odoo_service import OdooService
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "result": [{"id": 301, "name": "WH/OUT/001", "state": "assigned"}]
        }
        mock_post.return_value = mock_response

        service = OdooService()
        deliveries = service.get_deliveries(limit=5)
        self.assertEqual(len(deliveries), 1)
        self.assertEqual(deliveries[0]["name"], "WH/OUT/001")

    @patch("odoo_service.requests.post")
    def test_get_activities(self, mock_post):
        from odoo_service import OdooService
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "jsonrpc": "2.0",
            "id": 1,
            "result": [{"id": 12, "summary": "Call client regarding invoice"}]
        }
        mock_post.return_value = mock_response

        service = OdooService()
        activities = service.get_activities(limit=5)
        self.assertEqual(len(activities), 1)
        self.assertEqual(activities[0]["summary"], "Call client regarding invoice")

    @patch("odoo_service.requests.post")
    def test_get_customer_ledger(self, mock_post):
        from odoo_service import OdooService
        mock_response = MagicMock()
        mock_response.status_code = 200
        # search_read called multiple times for partner, invoices, orders
        mock_response.json.side_effect = [
            {"jsonrpc": "2.0", "id": 1, "result": [{"id": 15, "name": "Rahim Brothers", "credit": 50000.0, "debit": 20000.0}]},
            {"jsonrpc": "2.0", "id": 2, "result": [{"id": 101, "name": "INV/2026/01", "amount_total": 30000.0}]},
            {"jsonrpc": "2.0", "id": 3, "result": [{"id": 201, "name": "SO001", "amount_total": 45000.0}]}
        ]
        mock_post.return_value = mock_response

        service = OdooService()
        ledger = service.get_customer_ledger(partner_id=15)
        self.assertEqual(ledger["partner"]["name"], "Rahim Brothers")
        self.assertEqual(len(ledger["invoices"]), 1)
        self.assertEqual(len(ledger["orders"]), 1)

if __name__ == "__main__":
    unittest.main()


