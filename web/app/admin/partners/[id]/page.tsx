"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const emptyPartner = {
  name: "",
  slug: "",
  description: "",
  category: "",
  location: "",
  city: "",
  address: "",
  images: [],
  activities: [],
  pricing: { credits: 0, price: 0, currency: "EUR" },
  openingHours: "",
  isActive: true,
};

export default function AdminPartnerEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";
  const [partner, setPartner] = useState<any>(emptyPartner);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/partners/${id}`)
        .then((res) => res.json())
        .then((data) => setPartner(data))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    setPartner((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSave() {
    setSaving(true);
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/partners` : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/partners/${id}`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partner),
    });
    setSaving(false);
    if (res.ok) router.push("/admin/partners");
    else alert("Erro ao salvar parceiro");
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{isNew ? "Novo parceiro" : `Editar parceiro: ${partner.name}`}</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <input name="name" value={partner.name} onChange={handleChange} placeholder="Nome" className="border px-2 py-1 rounded" required />
        <input name="slug" value={partner.slug} onChange={handleChange} placeholder="Slug" className="border px-2 py-1 rounded" required />
        <input name="description" value={partner.description} onChange={handleChange} placeholder="Descrição" className="border px-2 py-1 rounded" />
        <input name="category" value={partner.category} onChange={handleChange} placeholder="Categoria" className="border px-2 py-1 rounded" />
        <input name="location" value={partner.location} onChange={handleChange} placeholder="Localização" className="border px-2 py-1 rounded" />
        <input name="city" value={partner.city} onChange={handleChange} placeholder="Cidade" className="border px-2 py-1 rounded" />
        <input name="address" value={partner.address} onChange={handleChange} placeholder="Endereço" className="border px-2 py-1 rounded" />
        <input name="openingHours" value={partner.openingHours} onChange={handleChange} placeholder="Horário de funcionamento" className="border px-2 py-1 rounded" />
        <input name="pricing.credits" type="number" value={partner.pricing?.credits ?? 0} onChange={e => setPartner((p: any) => ({ ...p, pricing: { ...p.pricing, credits: Number(e.target.value) } }))} placeholder="Créditos" className="border px-2 py-1 rounded" />
        <input name="pricing.price" type="number" value={partner.pricing?.price ?? 0} onChange={e => setPartner((p: any) => ({ ...p, pricing: { ...p.pricing, price: Number(e.target.value) } }))} placeholder="Preço" className="border px-2 py-1 rounded" />
        <input name="pricing.currency" value={partner.pricing?.currency ?? "EUR"} onChange={e => setPartner((p: any) => ({ ...p, pricing: { ...p.pricing, currency: e.target.value } }))} placeholder="Moeda" className="border px-2 py-1 rounded" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" checked={!!partner.isActive} onChange={handleChange} /> Ativo
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
      </form>
    </div>
  );
}
