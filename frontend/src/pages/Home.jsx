import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { getProducts } from "../api/catalog";
import { getRecommendations } from "../api/recommendation";
import ProductCard from "../components/ProductCard";
import RecommendationChip from "../components/RecommendationChip";
import Skeleton from "../components/ui/Skeleton";
import Badge from "../components/ui/Badge";
import { Sparkles } from "lucide-react";

const categories = ["Tudo", "Eletrônicos", "Moda", "Casa", "Acessórios"];

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tudo");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, recommendationsData] = await Promise.all([
          getProducts(),
          getRecommendations().catch(() => []),
        ]);
        setProducts(productsData);
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Tudo" || product.category === selectedCategory;
      const matchesSearch =
        searchDebounced === "" ||
        product.name.toLowerCase().includes(searchDebounced.toLowerCase()) ||
        product.category.toLowerCase().includes(searchDebounced.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchDebounced]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  return (
    <main className="min-h-screen w-full pb-20 md:pb-8 flex flex-col items-center">
      <div className="max-w-7xl w-full px-4 py-6">
        {/* Bloco de boas-vindas — espaço generoso abaixo antes das categorias */}
        <div className="mb-10 text-left lg:text-center flex flex-col items-start lg:items-center">
          <h1 className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--text-primary)]">
            Olá, {user?.name?.split(" ")[0] || "visitante"}
          </h1>
          {/* mt-3 desgruda o subtítulo do título principal */}
          <p className="text-[14px] text-[var(--text-secondary)] mt-3">
            {loading
              ? "Carregando produtos..."
              : `${products.length} produtos disponíveis para você`}
          </p>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:outline-none transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Category Pills — mb-14 abre espaço claro entre categorias e o que vem depois */}
        <div
          className="
          flex gap-2 pb-8 mb-4 w-full
          overflow-x-auto whitespace-nowrap justify-start
          lg:overflow-visible lg:flex-wrap lg:justify-center lg:whitespace-normal
        "
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`
                px-4 py-2 rounded-[var(--radius-full)] text-[13px] font-medium
                whitespace-nowrap transition-all duration-150 shrink-0
                ${
                  selectedCategory === category
                    ? "bg-[var(--brand-light)] text-[var(--brand)] border border-[var(--brand)]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-6 mb-16 w-full">
            {/* Aumentamos de 'mb-5' para 'mb-6' para afastar o badge roxo dos mini cards */}
            <div className="flex justify-start lg:justify-center mb-6">
              <Badge color="brand">
                <Sparkles className="w-3 h-3" />
                Recomendado para você
              </Badge>
            </div>
            <div className="flex flex-row lg:flex-wrap justify-start lg:justify-center gap-4 overflow-x-auto pb-2 lg:overflow-visible w-full">
              {recommendations.map((product) => (
                <RecommendationChip key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center w-full"
            aria-busy="true"
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] overflow-hidden w-full max-w-xs"
              >
                <Skeleton height="120px" rounded="none" />
                <div className="p-3 space-y-2">
                  <Skeleton height="16px" width="80%" />
                  <Skeleton height="12px" width="50%" />
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton height="18px" width="60px" />
                    <Skeleton height="32px" width="32px" rounded="full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 w-full">
            <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[var(--text-tertiary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="font-['DM_Sans'] text-[18px] font-medium text-[var(--text-primary)]">
              Nenhum produto encontrado
            </h3>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1">
              Tente ajustar os filtros ou buscar por outro termo
            </p>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center w-full">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
