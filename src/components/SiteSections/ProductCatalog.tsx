import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface Product {
  name: string;
  price: string;
  description: string;
  image_keyword?: string;
}

interface ProductCatalogProps {
  content: {
    title?: string;
    products: Product[];
    visual_variant?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ content, primaryColor, isMobile }) => {
  const products = Array.isArray(content?.products) ? content.products : [];
  if (products.length === 0) return null;
  const variant = String(content.visual_variant || "").toLowerCase();
  const premium = variant === "premium";
  const sectionTone = premium ? "bg-slate-950" : "bg-slate-50";
  const headingTone = premium ? "text-slate-50" : "text-slate-950";
  const cardTone = premium
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-100 text-slate-950";
  const copyTone = premium ? "text-slate-400" : "text-slate-500";
  const mediaTone = premium ? "bg-slate-800" : "bg-slate-200";
  const buttonTone = premium ? "bg-white text-slate-900" : "bg-slate-900 text-white";

  return (
    <section className={`py-20 ${sectionTone}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className={`text-3xl font-bold mb-12 text-center ${headingTone}`}>{content.title || "Nossos Produtos"}</h2>
        <div className={`grid gap-8 ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}>
          {products.map((product: Product, i: number) => (
            <div key={i} className={`rounded-3xl overflow-hidden shadow-md border group ${cardTone}`}>
              <div className={`aspect-square overflow-hidden ${mediaTone}`}>
                {(() => {
                  const seed = encodeURIComponent(product.image_keyword || product.name || `product-${i + 1}`);
                  const url = `https://picsum.photos/seed/${seed}/600/600`;
                  return (
                <img 
                  src={url}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={product.name || "Produto"}
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/600/600";
                  }}
                />
                  );
                })()}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                <p className={`text-sm mb-4 ${copyTone}`}>{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black" style={{ color: primaryColor }}>{product.price}</span>
                  <button className={`p-3 rounded-xl hover:opacity-80 transition-opacity ${buttonTone}`}>
                    <ShoppingBag size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
