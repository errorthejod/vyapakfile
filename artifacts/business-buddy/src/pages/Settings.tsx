import Layout from "@/components/Layout";
import { useCurrentStore as useStore } from "@/store/useCurrentStore";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store, Phone, Mail, MapPin, FileText, Hash, ScrollText, Image, PenLine, Stamp, X, Upload } from "lucide-react";

const ImageUploadBox = ({
  label,
  icon,
  hint,
  value,
  onChange,
  onClear,
  previewHeight = 80,
}: {
  label: string;
  icon: React.ReactNode;
  hint: string;
  value?: string;
  onChange: (base64: string) => void;
  onClear: () => void;
  previewHeight?: number;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div>
      <Label className="flex items-center gap-1.5 mb-2 text-sm font-medium">
        {icon} {label}
      </Label>
      <div
        className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/60 transition-colors"
        style={{ minHeight: `${previewHeight + 24}px` }}
        onClick={() => !value && inputRef.current?.click()}
      >
        {value ? (
          <div className="flex flex-col items-center justify-center p-3 gap-2">
            <img src={value} alt={label} style={{ maxHeight: `${previewHeight}px`, maxWidth: '100%', objectFit: 'contain' }} className="rounded" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} className="text-xs gap-1 h-7">
                <Upload className="h-3 w-3" /> Change
              </Button>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-xs gap-1 h-7 text-destructive hover:text-destructive">
                <X className="h-3 w-3" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-muted-foreground gap-2">
            <Upload className="h-6 w-6 opacity-50" />
            <p className="text-xs text-center">{hint}</p>
            <Button size="sm" variant="outline" className="text-xs gap-1 h-7 mt-1">
              <Upload className="h-3 w-3" /> Upload Image
            </Button>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

const SettingsPage = () => {
  const { shopInfo, updateShopInfo } = useStore();
  const [form, setForm] = useState({ ...shopInfo });

  const handleSave = () => {
    updateShopInfo(form);
    toast.success("Business info updated!");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Business Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">These details appear on all your invoices</p>
        </div>

        {/* ── SHOP INFO ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl card-shadow max-w-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-primary/5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">Shop / Business Information</h3>
              <p className="text-xs text-muted-foreground">Updates apply to all new invoices</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium">
                <Store className="h-3.5 w-3.5 text-primary" /> Shop / Business Name
              </Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Shuvidha Telecom"
                className="text-sm"
              />
            </div>

            <div>
              <Label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Address
                <span className="text-xs font-normal text-muted-foreground">(press Enter to add new line)</span>
              </Label>
              <textarea
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder={"Shop No., Street\nCity, State - PIN"}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium">
                  <Phone className="h-3.5 w-3.5 text-primary" /> Mobile / Phone
                </Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="10-digit mobile"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium">
                  <Mail className="h-3.5 w-3.5 text-primary" /> Gmail / Email
                </Label>
                <Input
                  value={form.email || ""}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="yourname@gmail.com"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium">
                  <FileText className="h-3.5 w-3.5 text-primary" /> GSTIN
                </Label>
                <Input
                  value={form.gst}
                  onChange={e => setForm({ ...form, gst: e.target.value })}
                  placeholder="GST Identification No."
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium">
                  <Hash className="h-3.5 w-3.5 text-primary" /> GT No / Other Tax No
                </Label>
                <Input
                  value={form.gtNo || ""}
                  onChange={e => setForm({ ...form, gtNo: e.target.value })}
                  placeholder="GT / Trade / other no."
                  className="text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleSave} className="px-8">
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── LOGO & SIGNATURE ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="bg-card rounded-xl card-shadow max-w-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-primary/5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">Logo, Signature & Stamp</h3>
              <p className="text-xs text-muted-foreground">These appear on printed invoices</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <ImageUploadBox
              label="Company Logo"
              icon={<Image className="h-3.5 w-3.5 text-primary" />}
              hint="Logo appears in the top-right of the invoice (replaces 'ORIGINAL FOR RECIPIENT' text)"
              value={form.logoImage}
              onChange={(b64) => setForm(f => ({ ...f, logoImage: b64 }))}
              onClear={() => setForm(f => ({ ...f, logoImage: undefined }))}
              previewHeight={70}
            />

            <div className="grid grid-cols-2 gap-4">
              <ImageUploadBox
                label="Signature"
                icon={<PenLine className="h-3.5 w-3.5 text-primary" />}
                hint="Signature appears above 'Authorised Signatory'. Leave blank to sign by hand."
                value={form.signatureImage}
                onChange={(b64) => setForm(f => ({ ...f, signatureImage: b64 }))}
                onClear={() => setForm(f => ({ ...f, signatureImage: undefined }))}
                previewHeight={60}
              />
              <ImageUploadBox
                label="Stamp"
                icon={<Stamp className="h-3.5 w-3.5 text-primary" />}
                hint="Stamp image appears next to the signature. Leave blank to stamp by hand."
                value={form.stampImage}
                onChange={(b64) => setForm(f => ({ ...f, stampImage: b64 }))}
                onClear={() => setForm(f => ({ ...f, stampImage: undefined }))}
                previewHeight={60}
              />
            </div>

            <div>
              <Button onClick={handleSave} className="px-8">
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── TERMS & CONDITIONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-card rounded-xl card-shadow max-w-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-primary/5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ScrollText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">Terms & Conditions</h3>
              <p className="text-xs text-muted-foreground">Printed at the bottom of every invoice</p>
            </div>
          </div>

          <div className="p-6">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              Terms & Conditions text (one line per condition)
            </Label>
            <textarea
              value={form.termsAndConditions ?? "1. Goods once sold will not be taken back.\n2. Subject to local jurisdiction only.\n3. All disputes subject to local jurisdiction."}
              onChange={e => setForm({ ...form, termsAndConditions: e.target.value })}
              rows={6}
              placeholder={"1. Goods once sold will not be taken back.\n2. Subject to local jurisdiction only."}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-2">Each line will appear as a separate condition on the invoice.</p>
            <div className="pt-4">
              <Button onClick={handleSave} className="px-8">
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
