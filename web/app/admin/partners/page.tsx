"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/partners`)
      .then((res) => res.json())
      .then((data) => setPartners(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = partners.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Parceiros</h1>
      <div className="mb-4 flex gap-2">
        <input
          className="border px-2 py-1 rounded w-64"
          placeholder="Pesquisar por nome ou categoria"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link href="/admin/partners/new" className="bg-blue-600 text-white px-4 py-2 rounded">Novo parceiro</Link>
      </div>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Nome</th>
              <th className="border p-2">Categoria</th>
              <th className="border p-2">Cidade</th>
              <th className="border p-2">Ativo</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id}>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.category}</td>
                <td className="border p-2">{p.city}</td>
                <td className="border p-2">{p.isActive ? "Sim" : "Não"}</td>
                <td className="border p-2 flex gap-2">
                  <Link href={`/admin/partners/${p._id}`} className="text-blue-600 underline">Editar</Link>
                  <button
                    className="text-red-600 underline"
                    onClick={async () => {
                      if (!confirm("Remover este parceiro?")) return;
                      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/partners/${p._id}`, { method: "DELETE" });
                      setPartners((prev) => prev.filter((x) => x._id !== p._id));
                    }}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
