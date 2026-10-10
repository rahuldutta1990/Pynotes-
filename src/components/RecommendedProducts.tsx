import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { motion } from 'framer-motion';

export const RecommendedProducts: React.FC = () => {
  const { products, orders, currentUser } = useStore();

  const recommendations = useMemo(() => {
    if (!currentUser) return [];

    // 1. Get user's purchase history
    const userOrders = orders.filter((o) => o.customerEmail === currentUser.email);
    const purchasedProductIds = new Set<string>();
    const categoryCounts: Record<string, number> = {};

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        purchasedProductIds.add(item.productId);
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          categoryCounts[product.category] = (categoryCounts[product.category] || 0) + item.quantity;
        }
      });
    });

    // 2. Identify top category
    let topCategory = '';
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    // 3. Find recommendations
    // Priority: Same category, not purchased yet
    let recs = products.filter(
      (p) => !purchasedProductIds.has(p.id) && p.category === topCategory
    );

    // Fallback if no specific category recommendations
    if (recs.length < 2) {
      const allOthers = products.filter((p) => !purchasedProductIds.has(p.id));
      recs = [...recs, ...allOthers];
    }

    return Array.from(new Set(recs)).slice(0, 4);
  }, [currentUser, orders, products]);

  if (recommendations.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-[#071E38] mb-8">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
