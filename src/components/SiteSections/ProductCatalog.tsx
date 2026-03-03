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
    products: Product[]; // A IA deve retornar um array de produtos aqui
  };
  primaryColor: string;
  isMobile: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ content, primaryColor, isMobile }) => {
  const products = Array.isArray(content?.products) ? content.products : [];
  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold mb-12 text-center">{content.title || "Nossos Produtos"}</h2>
        <div className={`grid gap-8 ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}>
          {products.map((product: Product, i: number) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 group">
              <div className="aspect-square bg-slate-200 overflow-hidden">
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
                <p className="text-slate-500 text-sm mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black" style={{ color: primaryColor }}>{product.price}</span>
                  <button className="p-3 rounded-xl bg-slate-900 text-white hover:opacity-80 transition-opacity">
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
