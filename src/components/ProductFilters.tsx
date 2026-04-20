import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Filter, RotateCcw, Check, ChevronRight, ShoppingBag, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  features: string[];
  rating: number;
  inStock: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  sortBy: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFilters) => void;
  categories: string[];
  className?: string;
}

const ProductFiltersComponent = ({ onFiltersChange, categories, className = "" }: ProductFiltersProps) => {
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 50000],
    features: [],
    rating: 0,
    inStock: false,
    isBestseller: false,
    isNewArrival: false,
    sortBy: 'name',
  });

  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    fetchAvailableFeatures();
  }, []);

  const fetchAvailableFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('product_features')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableFeatures(data?.map(f => f.name) || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      setAvailableFeatures([
        'Cotton', 'Silk', 'Zari', 'Embroidered', 'Festive',
        'Casual', 'Bridal', 'Sustainable', 'Designer', 'Limited'
      ]);
    } finally {
      setLoadingFeatures(false);
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    updateFilters({ features: newFeatures });
  };

  const clearAllFilters = () => {
    const clearedFilters: ProductFilters = {
      categories: [],
      priceRange: [0, 50000],
      features: [],
      rating: 0,
      inStock: false,
      isBestseller: false,
      isNewArrival: false,
      sortBy: 'name',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) count++;
    if (filters.features.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.isBestseller) count++;
    if (filters.isNewArrival) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={cn("space-y-8", className)}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-default)]">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--color-brand-red)]" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] uppercase tracking-tight">
            Refine Selection
          </h3>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="group flex items-center gap-1.5 text-xs font-medium text-[var(--color-brand-red)] hover:text-[var(--color-brand-red-deep)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform" />
            Reset All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Category
          </h4>
          {filters.categories.length > 0 && (
            <Badge variant="secondary" className="bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)] border-none">
              {filters.categories.length}
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1">
          {categories.filter(c => c !== 'All').map((category) => {
            const isActive = filters.categories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                  isActive 
                    ? "bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)] font-semibold" 
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-page)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <span className="capitalize">{category}</span>
                {isActive ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-6">
        <h4 className="text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Price Point
        </h4>
        <div className="px-1 pt-2">
          <Slider
            defaultValue={[filters.priceRange[1]]}
            max={50000}
            step={500}
            onValueChange={(value) => updateFilters({ priceRange: [0, value[0]] })}
            className="py-1"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-bold">₹0</span>
            <span className="text-sm font-bold text-[var(--color-brand-red)] bg-[var(--color-brand-red-light)] px-2 py-0.5 rounded">
              Up to ₹{filters.priceRange[1].toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Under ₹2k', max: 2000 },
            { label: 'Under ₹5k', max: 5000 },
            { label: 'Under ₹10k', max: 10000 },
            { label: 'Premium', max: 50000 }
          ].map((pf, i) => (
            <button
              key={i}
              onClick={() => updateFilters({ priceRange: [0, pf.max] })}
              className="text-[10px] font-bold uppercase py-2 rounded-lg border border-[var(--color-border-default)] hover:border-[var(--color-brand-red)] hover:text-[var(--color-brand-red)] bg-white dark:bg-transparent transition-all"
            >
              {pf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attributes */}
      <div className="space-y-4">
        <h4 className="text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Product Attributes
        </h4>
        <div className="space-y-3 max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--color-border-default)]">
          {loadingFeatures ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-5 bg-[var(--color-surface-page)] rounded animate-pulse w-full"></div>
              ))}
            </div>
          ) : availableFeatures.map((feature) => {
            const isChecked = filters.features.includes(feature);
            return (
              <div 
                key={feature} 
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => toggleFeature(feature)}
              >
                <Checkbox 
                  id={`feature-${feature}`} 
                  checked={isChecked} 
                  className="rounded-md border-[var(--color-border-default)] data-[state=checked]:bg-[var(--color-brand-red)] data-[state=checked]:border-[var(--color-brand-red)]"
                />
                <label
                  htmlFor={`feature-${feature}`}
                  className={cn(
                    "text-sm font-medium leading-none cursor-pointer transition-colors",
                    isChecked ? "text-[var(--color-brand-red)] font-semibold" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {feature}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-4">
        <h4 className="text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Customer Rating
        </h4>
        <div className="space-y-2">
          {[4, 3, 2].map((star) => (
            <button
              key={star}
              onClick={() => updateFilters({ rating: star })}
              className={cn(
                "flex items-center gap-2 w-full text-sm py-1.5 px-2 rounded-lg transition-colors",
                filters.rating === star ? "bg-[var(--color-brand-yellow)]/10 text-[var(--color-brand-red)] font-semibold" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-page)]"
              )}
            >
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={cn(i < star ? "fill-[var(--color-brand-gold)] text-[var(--color-brand-gold)]" : "text-[var(--color-border-default)]")} />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Special Tags */}
      <div className="pt-6 border-t border-[var(--color-border-default)] space-y-3">
        {[
          { id: 'inStock', label: 'In Stock Only', icon: ShoppingBag, checked: filters.inStock },
          { id: 'isNewArrival', label: 'New Arrivals', icon: Star, checked: filters.isNewArrival },
          { id: 'isBestseller', label: 'Bestsellers', icon: Zap, checked: filters.isBestseller }
        ].map((toggle) => (
          <div 
            key={toggle.id} 
            className={cn(
              "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
              toggle.checked 
                ? "border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)] shadow-sm" 
                : "border-[var(--color-border-default)] hover:border-[var(--color-brand-red)]/30 hover:bg-[var(--color-surface-page)]"
            )}
            onClick={() => updateFilters({ [toggle.id]: !toggle.checked })}
          >
            <div className="flex items-center gap-2.5">
              <toggle.icon className={cn("w-4 h-4", toggle.checked ? "text-[var(--color-brand-red)]" : "text-[var(--color-text-muted)]")} />
              <span className={cn("text-sm font-medium", toggle.checked ? "text-[var(--color-brand-red)]" : "text-[var(--color-text-primary)]")}>
                {toggle.label}
              </span>
            </div>
            <div className={cn(
              "w-7 h-3.5 rounded-full relative transition-colors duration-200",
              toggle.checked ? "bg-[var(--color-brand-red)]" : "bg-gray-200 dark:bg-gray-700"
            )}>
              <div className={cn(
                "absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all duration-200",
                toggle.checked ? "left-4" : "left-0.5"
              )}></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProductFiltersComponent;
