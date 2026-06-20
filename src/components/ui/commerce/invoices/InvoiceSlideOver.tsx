import React from "react";
import { Receipt, Printer, X, User, Mail, CreditCard, MapPin } from "lucide-react";

interface InvoiceSlideOverProps {
  selectedInvoice: any | null;
  onClose: () => void;
  formatMethod: (m: string) => string;
  statusBadge: (s: string) => React.ReactNode;
}

export default function InvoiceSlideOver({
  selectedInvoice,
  onClose,
  formatMethod,
  statusBadge,
}: InvoiceSlideOverProps) {
  if (!selectedInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0 no-print" onClick={onClose} />
      <div
        id="invoice-print-area"
        className="relative z-10 w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl flex flex-col overflow-y-auto"
      >
        {/* Slide-over header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="text-primary" size={18} />
            <span className="font-heading font-black text-sm uppercase tracking-wider">Invoice Detail</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="h-8 px-3 bg-primary hover:bg-primary/90 text-white text-[11px] font-bold rounded-lg shadow flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Printer size={12} /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="flex-1 p-6 md:p-8 space-y-7">
          {/* Company + Invoice meta */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-dashed border-border/70">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white font-black text-xs shrink-0">Z</div>
                <span className="font-heading font-black tracking-widest text-sm uppercase">Zenith Commerce</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed pl-9">
                45 Banani Ave, Dhaka 1213, Bangladesh<br />billing@zenithcommerce.io
              </p>
            </div>
            <div className="sm:text-right space-y-1">
              <h3 className="font-mono font-black text-foreground text-base">{selectedInvoice.invoiceNumber}</h3>
              <p className="text-[10px] text-muted-foreground">
                Date: <strong>{new Date(selectedInvoice.invoiceDate || selectedInvoice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</strong>
              </p>
              <p className="text-[10px] text-muted-foreground">
                Method: <strong>{formatMethod(selectedInvoice.paymentMethod)}</strong>
              </p>
              <div className="pt-1">{statusBadge(selectedInvoice.paymentStatus)}</div>
            </div>
          </div>

          {/* Billing + Shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Billed To</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <User size={12} className="text-muted-foreground shrink-0" /> {selectedInvoice.user?.name || "—"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={12} className="shrink-0" /> {selectedInvoice.user?.email || "—"}
                </div>
                {selectedInvoice.user?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard size={12} className="shrink-0" /> {selectedInvoice.user.phone}
                  </div>
                )}
              </div>
            </div>
            {selectedInvoice.shippingAddress && (
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Ship To</p>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin size={12} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {selectedInvoice.shippingAddress.fullName}<br />
                    {selectedInvoice.shippingAddress.address}, {selectedInvoice.shippingAddress.city}<br />
                    {selectedInvoice.shippingAddress.phone}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Items table */}
          <div className="space-y-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Line Items</p>
            <div className="border border-border rounded-xl overflow-hidden bg-muted/5">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60 text-[9px] font-bold text-muted-foreground uppercase">
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {selectedInvoice.items?.map((item: any, i: number) => (
                    <tr key={i} className="text-foreground">
                      <td className="p-3 font-semibold truncate max-w-[200px]">{item.product?.name || "Product"}</td>
                      <td className="p-3 text-center font-mono">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">${item.price?.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold font-mono">${(item.price * item.quantity)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs border-t border-border/70 pt-4">
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-foreground">${selectedInvoice.subtotal?.toFixed(2)}</span>
              </div>
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-rose-500 font-medium">
                  <span>Discount</span>
                  <span className="font-mono font-bold">-${selectedInvoice.discount?.toFixed(2)}</span>
                </div>
              )}
              {selectedInvoice.vat > 0 && (
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>VAT</span>
                  <span className="font-mono font-bold text-foreground">${selectedInvoice.vat?.toFixed(2)}</span>
                </div>
              )}
              {selectedInvoice.deliveryCharge > 0 && (
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Delivery</span>
                  <span className="font-mono font-bold text-foreground">${selectedInvoice.deliveryCharge?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-black text-foreground">
                <span>Total</span>
                <span className="font-mono text-primary text-base">${selectedInvoice.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="no-print shrink-0 border-t border-border/40 px-6 py-3 flex justify-between items-center text-[10px] text-muted-foreground">
          <span>Order ref: <strong>{typeof selectedInvoice.order === "string" ? selectedInvoice.order : selectedInvoice.order?._id || "—"}</strong></span>
          <span className="text-primary font-bold italic">Thank you for your business!</span>
        </div>
      </div>
    </div>
  );
}
