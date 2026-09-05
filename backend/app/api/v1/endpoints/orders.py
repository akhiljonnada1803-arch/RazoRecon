from fastapi import APIRouter, HTTPException, Path, Response, Query
from typing import Optional

from app.services.invoice_pdf_service import invoice_pdf_service
from app.services.customer_order_service import customer_order_service

router = APIRouter()


@router.get("/{order_id}/invoice")
@router.get("/orders/{order_id}/invoice")
def get_order_invoice_pdf(
    order_id: str = Path(..., description="Unique Order ID or Order Number"),
    disposition: Optional[str] = Query("attachment", description="attachment or inline"),
    format: Optional[str] = Query("pdf", description="pdf or json")
):
    """
    Generate authentic, GST-compliant single-page A4 invoice PDF for an order.
    Returns application/pdf with Content-Disposition attachment filename: Invoice_<OrderId>.pdf
    """
    if format.lower() == "json":
        try:
            return customer_order_service.generate_tax_invoice(order_id)
        except ValueError as ve:
            raise HTTPException(status_code=404, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate invoice data: {str(e)}")

    try:
        pdf_bytes = invoice_pdf_service.generate_invoice_pdf(order_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate invoice PDF: {str(e)}")

    clean_id = order_id.replace("/", "_").replace("\\", "_")
    filename = f"Invoice_{clean_id}.pdf"
    content_disp = "inline" if disposition.lower() == "inline" else f'attachment; filename="{filename}"'

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": content_disp,
            "Content-Type": "application/pdf",
            "X-Invoice-Compliant": "GST-Single-A4",
            "Cache-Control": "public, max-age=3600"
        }
    )
