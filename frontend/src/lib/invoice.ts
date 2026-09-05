/**
 * Utility for downloading GST-compliant Invoice PDFs.
 * Triggers automatic browser download of 'Invoice_<orderId>.pdf'.
 */
export async function downloadOrderInvoice(orderId: string): Promise<boolean> {
  if (!orderId) {
    console.error('downloadOrderInvoice called with empty orderId');
    return false;
  }

  const cleanId = orderId.trim();
  const filename = `Invoice_${cleanId}.pdf`;

  try {
    // Primary route through Next.js proxy
    let response = await fetch(`/api/v1/orders/${encodeURIComponent(cleanId)}/invoice`);

    // Fallback directly to backend port if proxy unavailable in dev
    if (!response.ok && typeof window !== 'undefined') {
      const directResponse = await fetch(`http://127.0.0.1:8000/api/v1/orders/${encodeURIComponent(cleanId)}/invoice`)
        .catch(() => null);
      if (directResponse && directResponse.ok) {
        response = directResponse;
      }
    }

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error(`Failed to download invoice for order ${orderId}:`, error);
    // Graceful fallback to direct navigation download
    window.open(`/api/v1/orders/${encodeURIComponent(cleanId)}/invoice`, '_blank');
    return false;
  }
}
