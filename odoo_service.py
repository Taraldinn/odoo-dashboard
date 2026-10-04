"""
odoo_service.py
Reusable Odoo ERP & MCP API Service layer for Python backends (Django / FastAPI / Flask / scripts).
Supports Bearer token authentication via ODOO_MCP_KEY and standard Odoo JSON-RPC / External API.
"""

import os
import random
from typing import Any, Dict, List, Optional
import requests


class OdooRPCError(Exception):
    """Raised when Odoo JSON-RPC returns an error in the response body."""
    pass


class OdooService:
    """
    Client for interacting with Odoo ERP via JSON-RPC / External API.
    Reads credentials from environment variables by default.
    """

    def __init__(
        self,
        url: Optional[str] = None,
        db: Optional[str] = None,
        mcp_key: Optional[str] = None,
        timeout: int = 15,
    ):
        self.url = (url or os.environ.get("ODOO_URL") or "https://mime.odoo.com").rstrip("/")
        self.db = db or os.environ.get("ODOO_DB") or "mime"
        self.mcp_key = mcp_key or os.environ.get("ODOO_MCP_KEY") or ""
        self.timeout = timeout

    def get_headers(self) -> Dict[str, str]:
        """Returns standard headers required for Odoo API requests."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.mcp_key:
            headers["Authorization"] = f"Bearer {self.mcp_key}"
        return headers

    def call_json_rpc(self, service: str, method: str, args: List[Any]) -> Any:
        """
        Executes a low-level JSON-RPC call against Odoo's /jsonrpc endpoint.
        """
        endpoint = f"{self.url}/jsonrpc"
        payload = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": service,
                "method": method,
                "args": args,
            },
            "id": random.randint(1, 10_000_000),
        }

        response = requests.post(
            endpoint,
            headers=self.get_headers(),
            json=payload,
            timeout=self.timeout,
        )
        response.raise_for_status()

        data = response.json()
        if "error" in data:
            err = data["error"]
            err_msg = err.get("data", {}).get("message") or err.get("message") or "Unknown Odoo RPC error"
            raise OdooRPCError(f"Odoo RPC Error ({err.get('code', 'N/A')}): {err_msg}")

        return data.get("result")

    def execute_kw(
        self,
        model: str,
        method: str,
        args: Optional[List[Any]] = None,
        kwargs: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """
        Executes a model method via Odoo's 'object' service 'execute_kw'.
        """
        args = args or []
        kwargs = kwargs or {}
        rpc_args = [self.db, 2, self.mcp_key, model, method, args, kwargs]
        return self.call_json_rpc(service="object", method="execute_kw", args=rpc_args)

    def test_connection(self) -> Dict[str, Any]:
        """
        Tests the connection to Odoo server and validates credentials.
        """
        try:
            version_info = self.call_json_rpc("common", "version", [])
            return {
                "success": True,
                "url": self.url,
                "db": self.db,
                "version": version_info,
            }
        except Exception as exc:
            return {
                "success": False,
                "url": self.url,
                "db": self.db,
                "error": str(exc),
            }

    def search_read(
        self,
        model: str,
        domain: Optional[List[Any]] = None,
        fields: Optional[List[str]] = None,
        limit: int = 50,
        offset: int = 0,
        order: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search and read records from any Odoo model.
        """
        kwargs: Dict[str, Any] = {"limit": limit, "offset": offset}
        if fields:
            kwargs["fields"] = fields
        if order:
            kwargs["order"] = order

        result = self.execute_kw(
            model=model,
            method="search_read",
            args=[domain or []],
            kwargs=kwargs,
        )
        return result or []

    def create_record(self, model: str, values: Dict[str, Any]) -> int:
        """Creates a record in the specified Odoo model and returns its ID."""
        return self.execute_kw(model=model, method="create", args=[values])

    def write_record(self, model: str, record_ids: List[int], values: Dict[str, Any]) -> bool:
        """Updates records with the given IDs."""
        return self.execute_kw(model=model, method="write", args=[record_ids, values])

    def read_record(self, model: str, record_ids: List[int], fields: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Reads specific fields for given record IDs."""
        kwargs = {"fields": fields} if fields else {}
        return self.execute_kw(model=model, method="read", args=[record_ids], kwargs=kwargs)

    def unlink_record(self, model: str, record_ids: List[int]) -> bool:
        """Deletes records with the given IDs."""
        return self.execute_kw(model=model, method="unlink", args=[record_ids])

    # Domain-specific convenience methods
    def get_partners(self, limit: int = 50, is_customer: bool = True) -> List[Dict[str, Any]]:
        domain = [("customer_rank", ">", 0)] if is_customer else [("supplier_rank", ">", 0)]
        return self.search_read(
            "res.partner",
            domain=domain,
            fields=["id", "name", "email", "phone", "city", "street"],
            limit=limit,
        )

    def get_sale_orders(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.search_read(
            "sale.order",
            domain=[],
            fields=["id", "name", "partner_id", "amount_total", "state", "date_order"],
            limit=limit,
        )

    def get_payments(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.search_read(
            "account.payment",
            domain=[],
            fields=["id", "name", "partner_id", "amount", "payment_type", "state", "date"],
            limit=limit,
        )

    def get_invoices(self, limit: int = 50, invoice_type: Optional[str] = "out_invoice") -> List[Dict[str, Any]]:
        domain = [("move_type", "=", invoice_type)] if invoice_type else []
        return self.search_read(
            "account.move",
            domain=domain,
            fields=["id", "name", "partner_id", "amount_total", "amount_residual", "payment_state", "state", "invoice_date"],
            limit=limit,
        )

    def get_deliveries(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.search_read(
            "stock.picking",
            domain=[],
            fields=["id", "name", "origin", "partner_id", "state", "scheduled_date", "location_dest_id"],
            limit=limit,
        )

    def get_activities(self, limit: int = 50) -> List[Dict[str, Any]]:
        try:
            return self.search_read(
                "mail.activity",
                domain=[],
                fields=["id", "summary", "activity_type_id", "res_name", "res_model", "date_deadline", "create_date"],
                limit=limit,
            )
        except Exception:
            return self.search_read(
                "mail.message",
                domain=[],
                fields=["id", "subject", "body", "date", "author_id", "model", "record_name"],
                limit=limit,
            )

    def get_customer_ledger(self, partner_id: int) -> Dict[str, Any]:
        partner_info = self.search_read(
            "res.partner",
            domain=[("id", "=", partner_id)],
            fields=["id", "name", "email", "phone", "credit", "debit"],
            limit=1,
        )
        partner = partner_info[0] if partner_info else {}

        invoices = self.search_read(
            "account.move",
            domain=[("partner_id", "=", partner_id), ("move_type", "in", ["out_invoice", "out_refund"])],
            fields=["id", "name", "amount_total", "amount_residual", "payment_state", "state", "invoice_date"],
            limit=20,
        )

        orders = self.search_read(
            "sale.order",
            domain=[("partner_id", "=", partner_id)],
            fields=["id", "name", "amount_total", "state", "date_order"],
            limit=20,
        )

        return {
            "partner": partner,
            "invoices": invoices,
            "orders": orders,
        }

