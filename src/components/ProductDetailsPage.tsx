import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  CheckCircle,
  Layers,
  MapPin,
  Eye,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  HelpCircle,
  Clock,
  ThumbsUp,
  Award
} from 'lucide-react';
import { validatePincode, validateReview } from '../utils/validation';

export const ProductDetailsPage: React.FC = () => {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    addToCart,
    openCheckout,
    products,
    reviews,
    currentUser,
    handleAddReview,
    showToast,
    navigateTo
  } = useStore();

  const product = selectedProductForModal;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{
    checked: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

  // Tabs layout state
  const [activeTab, setActiveTab] = useState<'details' | 'syllabus' | 'samples' | 'faqs'>('details');

  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState(() => currentUser?.name || '');
  const [reviewerCollege, setReviewerCollege] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Sync reviewer name if current user changes
  useEffect(() => {
    if (currentUser?.name) {
      setReviewerName(currentUser.name);
    }
  }, [currentUser]);

  // Reset states when the selected product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setPincode('');
    setPincodeResult(null);
    setShowReviewForm(false);
    setActiveTab('details');
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-body">
        <h2 className="text-2xl font-black text-[#0B3561] font-heading">Product Not Found</h2>
        <p className="text-[#6D86A0] mt-2 text-sm">The selected product is unavailable or invalid.</p>
        <button
          onClick={() => navigateTo('store')}
          className="mt-6 bg-[#12A5B0] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0e8a93] cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </button>
      </div>
    );
  }

  const isSoldOut = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
  const discountPercent = Math.round(
    ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
  );

  const allImages = [product.coverImage, ...(product.sampleImages || [])];
  const relatedBundles = products.filter(
    (p) => p.isBundle && p.bundledProductIds?.includes(product.id)
  );

  const componentBooks = product.isBundle
    ? products.filter((p) => product.bundledProductIds?.includes(p.id))
    : [];

  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.replace(/\D/g, '');
    const pinRes = validatePincode(cleanPin);
    if (!pinRes.isValid) {
      setPincodeResult({
        checked: true,
        valid: false,
        message: pinRes.message || 'Please enter a valid 6-digit Indian PIN code.'
      });
      return;
    }
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 4);
    const dateStr = estDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    const stateText = pinRes.detectedState ? ` (${pinRes.detectedState})` : '';
    setPincodeResult({
      checked: true,
      valid: true,
      message: `Fast doorstep delivery to PIN ${cleanPin}${stateText} by ${dateStr} via Delhivery Express. COD available.`
    });
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addToCart(product, quantity);
    navigateTo('store'); 
    openCheckout();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    const reviewVal = validateReview(reviewerName, reviewComment, reviewRating);
    if (!reviewVal.isValid) {
      const firstErr = Object.values(reviewVal.errors)[0];
      setReviewError(firstErr);
      return;
    }

    await handleAddReview({
      id: `rev-${Date.now()}`,
      productId: product.id,
      customerName: reviewerName.trim(),
      college: reviewerCollege.trim() || (currentUser ? 'Verified Student' : 'Engineering Student'),
      rating: reviewRating,
      comment: reviewComment.trim(),
      verified: true,
      date: new Date().toISOString().split('T')[0]
    });
    showToast('Thank you! Your verified student review was posted live.');
    setReviewComment('');
    setReviewError(null);
    setShowReviewForm(false);
  };

  // Helper to dynamically identify options / format variants matching handwrittencode.com dropdown combos
  const getVariantsForProduct = () => {
    const list: Product[] = [];
    
    // Find the single copy version
    const singleBook = products.find(p => p.id === product.id && !p.isBundle) || product;
    list.push(singleBook);

    // Find custom combos or bundles that contain this book ID
    const relevantBundles = products.filter(p => p.isBundle && p.bundledProductIds?.includes(singleBook.id));
    relevantBundles.forEach(bundle => {
      if (!list.some(item => item.id === bundle.id)) {
        list.push(bundle);
      }
    });

    // Fallback: append general Core 4 pack if not already in the list
    const coreFour = products.find(p => p.id === 'bundle-all-four');
    if (coreFour && !list.some(item => item.id === coreFour.id)) {
      list.push(coreFour);
    }

    return list.slice(0, 3); // Return max 3 matching choices
  };

  const currentVariants = getVariantsForProduct();

  // Dynamic syllabus index for the Syllabus tab matching actual chapters
  const getSyllabusForProduct = (prod: Product) => {
    if (prod.id === 'book-python' || prod.category === 'Python') {
      return [
        { title: "Chapter 1: Python Basics & Memory", points: ["Interpreter vs Compiler", "Variable allocation in RAM", "ID and reference count", "Mutable vs Immutable types"] },
        { title: "Chapter 2: Data Structures", points: ["Lists and tuples under the hood", "Dictionary hashmap collisions", "Sets hashing & fast lookups", "Slicing and memory offsets"] },
        { title: "Chapter 3: Control Flow", points: ["Loops and iterator protocols", "Conditional branches & bytecodes", "List comprehensions", "Generator expressions"] },
        { title: "Chapter 4: Functional Python", points: ["First-class functions", "Lambda & anonymous functions", "Map, filter, reduce & zip", "Scope lookup rules (LEGB)"] },
        { title: "Chapter 5: Advanced Decorators", points: ["Closures and nested functions", "Function wrappers with @ syntax", "Stateful and class decorators", "Passing *args and **kwargs"] },
        { title: "Chapter 6: Object-Oriented", points: ["Classes, objects, and constructors", "Double underscore dunder methods", "Method Resolution Order (MRO)", "Polymorphism & Abstraction"] },
        { title: "Chapter 7: Interview Q&A", points: ["Top 75 placement questions", "Handwritten optimized solutions", "Memory profiling cheatsheet", "Common bugs & segfault maps"] }
      ];
    }
    if (prod.id === 'book-java' || prod.category === 'Java') {
      return [
        { title: "Chapter 1: JVM & Architecture", points: ["Java Virtual Machine internals", "Young Gen vs Old Gen spaces", "Garbage Collection algorithms", "Stack frame allocations"] },
        { title: "Chapter 2: Deep OOP Principles", points: ["Polymorphism and V-Tables", "Inheritance vs Composition", "Abstract classes & interfaces", "Encapsulation & Access modifiers"] },
        { title: "Chapter 3: Collections Framework", points: ["ArrayList vs LinkedList complexity", "HashMap buckets and red-black trees", "HashSet hashing mechanisms", "PriorityQueue heaps"] },
        { title: "Chapter 4: Multithreading", points: ["Thread lifecycle and scheduling", "Synchronized blocks & locks", "Volatile keyword & memory barriers", "ExecutorService & ThreadPools"] },
        { title: "Chapter 5: Stream API", points: ["Functional interfaces (Predicate, Consumer)", "Map, filter, reduce operations", "Lazy evaluation & pipelines", "Method references (ClassName::method)"] },
        { title: "Chapter 6: Spring Boot Foundational", points: ["Dependency Injection (DI)", "Inversion of Control (IoC)", "ApplicationContext loading", "Spring Boot starter pipelines"] },
        { title: "Chapter 7: Placement Guide", points: ["Standard Java interview questions", "Coding templates and cheat cards", "Best-practices & debugging tips"] }
      ];
    }
    if (prod.id === 'book-c') {
      return [
        { title: "Chapter 1: C Basics & Compilation", points: ["Preprocessors, compiler, assembler", "Static and dynamic linking", "Header files & include rules", "Memory segment mapping"] },
        { title: "Chapter 2: Storage Classes", points: ["Auto, register, static keywords", "Extern and global linkage", "Scope vs Lifetime of variables", "Call stack frames"] },
        { title: "Chapter 3: Pointers Demystified", points: ["Memory addresses & byte sizes", "Pointer declaration & dereferencing", "Double pointers (pointer to pointer)", "Null & void pointers"] },
        { title: "Chapter 4: Pointer Arithmetic", points: ["Array-pointer relationship", "Memory offset increments", "Multidimensional arrays in RAM", "Array decay to pointers"] },
        { title: "Chapter 5: Dynamic Memory", points: ["Malloc vs Calloc allocations", "Realloc size adjustments", "Freeing memory & dangling pointers", "Valgrind & memory leak maps"] },
        { title: "Chapter 6: Structs & Bit-fields", points: ["Structure packing & memory padding", "Typedef conventions", "Unions & overlapping memory", "Bit-level hardware fields"] },
        { title: "Chapter 7: File & Low-level", points: ["File descriptors (fopen, fclose)", "Error codes & perror handling", "Common segfault pitfalls"] }
      ];
    }
    if (prod.id === 'book-cpp') {
      return [
        { title: "Chapter 1: Standard C++ STL Overview", points: ["Namespaces, headers, fast I/O", "Competitive programming layouts", "Templates & generic classes", "Iterators & bounds check"] },
        { title: "Chapter 2: STL Containers", points: ["Vectors, deques, and lists", "Set and Map (Self-balancing BST)", "Unordered_set & Unordered_map (Hash)", "Stack, queue & priority_queue"] },
        { title: "Chapter 3: STL Algorithms", points: ["Std::sort with custom comparators", "Binary search (lower_bound, upper_bound)", "Reverse, rotate, and permutation", "Lambda expressions in C++11"] },
        { title: "Chapter 4: Smart Pointers & RAII", points: ["Unique_ptr exclusive ownership", "Shared_ptr reference counters", "Weak_ptr cyclic references", "Resource Acquisition Is Initialization"] },
        { title: "Chapter 5: Advanced C++ OOP", points: ["Virtual destructors", "Multiple inheritance & virtual base", "Friend classes & operator overloading", "Move semantics & rvalue references"] },
        { title: "Chapter 6: Big-O Reference", points: ["STL operation time complexities", "Worst-case hashing collisions", "Competitive cheat sheets"] }
      ];
    }
    if (prod.category === 'DSA' || prod.id === 'book-dsa-py' || prod.id === 'book-dsa-java') {
      return [
        { title: "Chapter 1: Algorithmic Complexity", points: ["Big-O, Big-Theta, Big-Omega", "Space and time complexity rules", "Master Theorem recursion solving", "Iterative vs Recursive tradeoffs"] },
        { title: "Chapter 2: Two Pointers & Sliding Window", points: ["Two sum variations, array reverse", "Fast and slow pointer (Floyd cycle)", "Fixed vs Variable sliding window", "Minimum window substring pattern"] },
        { title: "Chapter 3: Stacks & Queues", points: ["Monotonic stack (Next Greater Element)", "Circular queue and double deque", "Stack-based backtracking models", "Amortized complexity charts"] },
        { title: "Chapter 4: Trees & BST", points: ["Iterative and recursive traversals", "Lowest Common LCA finder", "Binary Search Tree properties", "Balanced tree factors"] },
        { title: "Chapter 5: Graphs & Traversals", points: ["Adjacency list and matrix", "BFS & DFS node traversal models", "Dijkstra and Bellman-Ford shortest paths", "Kruskal & Prim spanning tree maps"] },
        { title: "Chapter 6: Dynamic Programming", points: ["Memoization vs Tabulation", "0-1 Knapsack grid computation", "Longest Common Subsequence (LCS)", "Coin change and optimal subproblems"] },
        { title: "Chapter 7: Placement Sheet", points: ["Top 100 SDE coding questions", "Handwritten trace-tables", "FAANG interview cheatsheet"] }
      ];
    }
    if (prod.id === 'book-system-design') {
      return [
        { title: "Chapter 1: System Scaling Foundation", points: ["Vertical vs Horizontal scaling", "DNS, CDNs & reverse proxy flows", "SLA, SLO, and high availability metrics", "QPS and storage capacity calculation"] },
        { title: "Chapter 2: Load Balancing & Hashing", points: ["Layer 4 vs Layer 7 load balancers", "Round Robin, Least Connections", "Consistent Hashing & virtual nodes", "Consistent hash-ring maps"] },
        { title: "Chapter 3: Scalable Databases", points: ["SQL replication (master-slave)", "NoSQL database sharding models", "CAP Theorem trade-offs", "Index types (B-Tree vs LSM-Tree)"] },
        { title: "Chapter 4: Caching Architectures", points: ["Cache-aside, write-through, write-back", "Cache eviction policies (LRU, LFU)", "Redis cluster and master-replica node sync", "Cache stampede mitigation"] },
        { title: "Chapter 5: Event-Driven Streaming", points: ["Message Queues vs Pub-Sub models", "Kafka partitioned distributed commit log", "Zookeeper / KRaft coordination consensus", "At-least-once, exactly-once delivery"] },
        { title: "Chapter 6: System Blueprints", points: ["URL Shortener high-scale design", "WhatsApp chat persistent connections", "Netflix video transcoding & streaming", "Distributed Rate Limiter sliding window"] },
        { title: "Chapter 7: Senior Design Prep", points: ["High-availability checklists", "Trade-off matrices for system architectures", "Top 50 SDE-2/3 review questions"] }
      ];
    }
    
    if (prod.isBundle) {
      return [
        { title: "Book Set Collection Contents", points: ["Full printed books included in box", "Double-sided high contrast printing", "Lay-flat twin-loop spiral binding", "Durable premium paper pack"] },
        { title: "Premium Extra Assets", points: ["Bonus quick-reference cheatsheets", "Custom sticker pack included", "Collector branded study box packaging", "All-India free shipping included"] }
      ];
    }

    return [
      { title: "Chapter 1: Core Fundamentals", points: ["Basic concepts overview", "Syntax syntax and core keywords", "Memory representation of data types"] },
      { title: "Chapter 2: Practical Coding", points: ["Hands-on handwritten coding snippets", "Step-by-step trace tables & execution trees", "Common logic bugs and solutions"] },
      { title: "Chapter 3: Interview Masterclass", points: ["Placement exam targeted core topics", "Technical revision questions with answers", "Revision templates & quick guides"] }
    ];
  };

  const syllabusList = getSyllabusForProduct(product);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 font-body">
      
      {/* 1. STICKY / FLOATING BACK NAV HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigateTo('store')}
          className="text-[#0B3561] hover:text-[#12A5B0] font-black text-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
        <div className="text-[11px] font-bold text-[#6D86A0] uppercase tracking-widest hidden sm:block">
          Original {product.category} Series · Handwrittencode.com Style
        </div>
      </div>

      {/* 2. MAIN SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-[#CED7DF] p-5 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden">
        {/* Absolute Background Accent Ring */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DDF3F4]/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

        {/* LEFT COLUMN: HD IMAGE CAROUSEL WITH PREVIEW ARROWS */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative aspect-[4/3] sm:aspect-square bg-[#F7FAFC] rounded-2xl overflow-hidden border border-[#CED7DF] shadow-inner group">
            
            {/* Main Carousel Photo */}
            <img
              src={allImages[activeImageIndex] || product.coverImage}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />

            {/* Carousel Navigation Chevron Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#071E38] shadow-md border border-[#CED7DF] flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  aria-label="Previous sample image"
                >
                  <ChevronLeft className="w-6 h-6 text-[#0B3561] stroke-[2.5]" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#071E38] shadow-md border border-[#CED7DF] flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  aria-label="Next sample image"
                >
                  <ChevronRight className="w-6 h-6 text-[#0B3561] stroke-[2.5]" />
                </button>
              </>
            )}

            {/* Top Badge Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 font-heading">
              {product.badge && (
                <span className="bg-[#FFD54A] text-[#071E38] font-black text-[10px] sm:text-xs px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{product.badge}</span>
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-[#12A5B0] text-white font-black text-[10px] sm:text-xs px-3 py-1 rounded-lg shadow-sm">
                  SAVE {discountPercent}%
                </span>
              )}
            </div>

            {/* Page Count/Index Tracker Bubble */}
            <div className="absolute bottom-4 right-4 bg-[#071E38]/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full font-mono shadow-md flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#12A5B0]" />
              <span>Page {activeImageIndex + 1} of {allImages.length}</span>
            </div>
          </div>

          {/* Thumbnail preview strips (Clickable) */}
          {allImages.length > 1 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#3C5D81] uppercase tracking-wider flex items-center gap-1.5 font-heading">
                <span>Click to preview actual handwritten sheets:</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#12A5B0] ring-4 ring-[#DDF3F4] scale-105'
                        : 'border-[#CED7DF] opacity-65 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Physical specs list container */}
          <div className="bg-[#F7FAFC] rounded-2xl p-5 border border-[#CED7DF] text-xs space-y-3.5 shadow-xs">
            <div className="font-black text-[#0B3561] uppercase tracking-wider text-[11px] font-heading border-b border-[#E7EBEF] pb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#12A5B0]" />
              <span>Premium Publishing Standards</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[#3C5D81] font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12A5B0]" />
                <span><strong className="text-[#0B3561]">Paper:</strong> 100 GSM Non-bleed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12A5B0]" />
                <span><strong className="text-[#0B3561]">Binding:</strong> Spiral Wire Lay-Flat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12A5B0]" />
                <span><strong className="text-[#0B3561]">Size:</strong> Standard A4 Portrait</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12A5B0]" />
                <span><strong className="text-[#0B3561]">Printing:</strong> High-res 4-Color</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 border-t border-[#E7EBEF] pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD54A]" />
                <span><strong className="text-[#0B3561]">Guaranteed pages:</strong> {product.pages} Heavy Printed Pages</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INFO, PRICING, BUNDLES & ACTIONS */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category & Verified ratings header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#12A5B0] uppercase tracking-widest font-heading">
                {product.category} notes series
              </span>
              <div className="flex items-center gap-1.5 bg-[#F7FAFC] border border-[#CED7DF] px-3 py-1 rounded-2xl text-xs font-bold text-[#071E38] shadow-2xs">
                <div className="flex text-[#FFD54A]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#FFD54A] text-[#FFD54A]" />
                  ))}
                </div>
                <span className="font-mono text-xs">{product.rating}</span>
                <span className="text-[#6D86A0] font-normal text-[10px]">
                  ({product.reviewCount} students reviews)
                </span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3561] leading-tight font-heading">
              {product.title}
            </h1>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-[#0B3561] font-mono">
                ₹{product.salePrice.toLocaleString('en-IN')}
              </span>
              <span className="text-lg text-[#9DAEC0] line-through font-mono">
                ₹{product.regularPrice.toLocaleString('en-IN')}
              </span>
              <span className="bg-[#DDF3F4] text-[#12A5B0] text-xs font-black px-2.5 py-1 rounded-lg font-heading">
                SAVE ₹{(product.regularPrice - product.salePrice).toLocaleString('en-IN')} ({discountPercent}% OFF)
              </span>
            </div>

            {/* Real-time Inventory/Stock Alert */}
            <div>
              {isSoldOut ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 font-heading">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>Sold Out — Back in stock soon</span>
                </div>
              ) : isLowStock ? (
                <div className="bg-[#FFD54A]/25 border border-[#FFD54A] text-[#071E38] px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 animate-pulse font-heading">
                  <span className="w-2 h-2 rounded-full bg-[#FFD54A] animate-ping" />
                  <span>Hurry! Only {product.stockQuantity} printed copies left on shelf</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-[#12A5B0] flex items-center gap-2 bg-[#DDF3F4]/50 border border-[#A0DBDF]/40 p-2.5 px-4 rounded-xl inline-block">
                  <CheckCircle className="w-4.5 h-4.5 text-[#12A5B0]" />
                  <span>In Stock — Dispatched within 24 Hours with tracking</span>
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-[#3C5D81] text-xs sm:text-sm leading-relaxed">
              {product.shortDescription || product.description.slice(0, 150) + "..."}
            </p>

            {/* DYNAMIC VARIANT / COMBO SELECTOR (Same as handwrittencode.com variant selection) */}
            {currentVariants.length > 1 && (
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-black text-[#0B3561] uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#12A5B0]" />
                  <span>Select Format / Combo Deal:</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {currentVariants.map((v) => {
                    const isSelected = v.id === product.id;
                    const vDiscount = Math.round(((v.regularPrice - v.salePrice) / v.regularPrice) * 100);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedProductForModal(v)}
                        className={`w-full text-left rounded-2xl p-3.5 border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-[#DDF3F4]/30 border-[#12A5B0] ring-2 ring-[#12A5B0]/20 shadow-md scale-[1.01]'
                            : 'bg-white border-[#CED7DF] hover:border-[#12A5B0] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#12A5B0] bg-[#12A5B0]' : 'border-[#CED7DF]'
                          }`}>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-[#0B3561] text-xs truncate block group-hover:text-[#12A5B0]">
                              {v.title.split(':')[0]}
                            </span>
                            <span className="text-[10px] text-[#6D86A0] font-medium block">
                              {v.isBundle ? `Pack of ${v.bundledProductIds?.length} Books` : 'Single Subject Physical Book'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-[#0B3561]">₹{v.salePrice}</span>
                            <span className="text-[10px] bg-[#FFD54A] text-[#071E38] font-black px-1.5 py-0.5 rounded uppercase">
                              -{vDiscount}%
                            </span>
                          </div>
                          <span className="text-[9px] text-emerald-600 font-bold font-heading">
                            Prepaid + COD
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PINCODE DELIVERY CHECKER */}
            <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#CED7DF] space-y-2.5 mt-2 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B3561] font-heading">
                <MapPin className="w-3.5 h-3.5 text-[#12A5B0]" />
                <span>Check Delivery Speed & COD:</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN code (e.g., 560001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-white border border-[#CED7DF] rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#12A5B0] font-mono font-bold text-[#0B3561]"
                />
                <button
                  type="submit"
                  className="bg-[#0B3561] hover:bg-[#071E38] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer font-heading uppercase tracking-wider"
                >
                  Check
                </button>
              </form>
              {pincodeResult && (
                <div
                  className={`text-xs p-3 rounded-xl font-semibold leading-relaxed ${
                    pincodeResult.valid
                      ? 'bg-[#DDF3F4] text-[#0B3561] border border-[#A0DBDF]'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {pincodeResult.message}
                </div>
              )}
            </div>

          </div>

          {/* Quantity and Checkout CTA Actions */}
          <div className="pt-4 border-t border-[#E7EBEF] space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              
              {/* Quantity Counter */}
              <div className="flex items-center border border-[#CED7DF] rounded-xl bg-[#F7FAFC] overflow-hidden self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isSoldOut || quantity <= 1}
                  className="px-3.5 py-3 text-[#0B3561] hover:bg-[#E7EBEF] font-black text-sm cursor-pointer disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-3 py-3 font-black text-[#0B3561] text-sm min-w-8 text-center font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                  }
                  disabled={isSoldOut || quantity >= product.stockQuantity}
                  className="px-3.5 py-3 text-[#0B3561] hover:bg-[#E7EBEF] font-black text-sm cursor-pointer disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`flex-1 py-4 px-5 rounded-xl font-black text-xs flex items-center justify-center gap-2.5 transition-all font-heading uppercase tracking-wider ${
                  isSoldOut
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-[#0B3561] hover:bg-[#071E38] text-white shadow-md cursor-pointer active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#A0DBDF]" />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now (Direct Fast Checkout) */}
              <button
                onClick={handleBuyNow}
                disabled={isSoldOut}
                className={`flex-1 py-4 px-5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all font-heading uppercase tracking-wider ${
                  isSoldOut
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-[#12A5B0] hover:bg-[#0e8a93] text-white shadow-lg shadow-[#12A5B0]/25 cursor-pointer active:scale-98'
                }`}
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Delivery/Quality Indicators below buy flow */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] sm:text-[11px] text-[#6D86A0] font-bold border-t border-[#E7EBEF]/50 pt-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#12A5B0]" />
                <span>Free Express Delivery Across India</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#12A5B0]" />
                <span>48h Free Damaged Replacement Shield</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MULTI-TAB HIGHLIGHTS SYSTEM (Description, Syllabus, Samples, FAQs) */}
      <div className="mt-8 bg-white rounded-3xl border border-[#CED7DF] shadow-lg overflow-hidden">
        {/* Tab Headers bar */}
        <div className="flex border-b border-[#CED7DF] bg-[#F7FAFC] overflow-x-auto">
          {[
            { id: 'details', label: '📖 Details & Description', icon: FileText },
            { id: 'syllabus', label: '📋 Chapter Index', icon: BookOpen },
            { id: 'samples', label: '🖼️ Sample Sheets', icon: Eye },
            { id: 'faqs', label: '💬 FAQs & Support', icon: HelpCircle }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-4 text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-2 border-b-2 font-heading ${
                  isTabActive
                    ? 'border-[#12A5B0] text-[#12A5B0] bg-white'
                    : 'border-transparent text-[#6D86A0] hover:text-[#0B3561]'
                }`}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content body panels */}
        <div className="p-6 sm:p-8 lg:p-10 font-body">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="prose max-w-none text-xs sm:text-sm text-[#3C5D81] leading-relaxed space-y-4">
                <h4 className="text-base sm:text-lg font-black text-[#0B3561] font-heading flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FFD54A]" />
                  <span>The PyNotes Physical Learning Philosophy</span>
                </h4>
                <p>{product.description}</p>
                <p>
                  Every book contains curated programming modules written directly by top engineers who cleared interview rounds at FAANG, Microsoft, and Uber. All pages include heavy handwritten annotations, colorful flow diagrams, edge-case memory structures, and optimized algorithm steps designed for rapid revision before major tech interviews.
                </p>
              </div>

              {/* Features checklist grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-[#E7EBEF]">
                {product.features?.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs font-bold text-[#071E38]">
                    <CheckCircle className="w-4.5 h-4.5 text-[#12A5B0] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Dynamic books display block if isBundle */}
              {product.isBundle && componentBooks.length > 0 && (
                <div className="bg-[#DDF3F4]/60 border border-[#A0DBDF] rounded-2xl p-5 text-xs space-y-3 shadow-2xs mt-6">
                  <div className="font-black text-[#0B3561] flex items-center gap-2 font-heading text-sm">
                    <Layers className="w-5 h-5 text-[#12A5B0]" />
                    <span>Component Books inside this Stack Box ({componentBooks.length} books):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                    {componentBooks.map((b) => (
                      <div key={b.id} className="bg-white/70 border border-[#A0DBDF]/50 rounded-xl p-3 flex items-center gap-3">
                        <img src={b.coverImage} className="w-10 h-10 object-cover rounded-md" alt="" />
                        <div>
                          <span className="font-extrabold text-[#0B3561] text-xs block">{b.title}</span>
                          <span className="text-[10px] text-[#6D86A0] font-medium">{b.pages} spiral-bound pages</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYLLABUS INDEX (Custom dynamic syllabus matching C simplified, python simplified, etc.) */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="max-w-3xl">
                <h4 className="text-base sm:text-lg font-black text-[#0B3561] font-heading mb-2">
                  Complete Chapter Index & Syllabus
                </h4>
                <p className="text-[#6D86A0] text-xs font-medium">
                  Each topic has hand-sketched flowcharts and compiler mental-models printed inside.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {syllabusList.map((chapter, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-[#F7FAFC] border border-[#CED7DF] hover:bg-[#DDF3F4]/10 transition-colors">
                    <div className="font-black text-[#0B3561] text-xs sm:text-sm font-heading mb-2 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#12A5B0]" />
                      <span>{chapter.title}</span>
                    </div>
                    <ul className="space-y-1 pl-4 text-xs text-[#3C5D81] font-semibold list-disc">
                      {chapter.points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SAMPLES PREVIEW */}
          {activeTab === 'samples' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0B3561] font-heading mb-2">
                  High-Definition Sample Sheets
                </h4>
                <p className="text-[#6D86A0] text-xs font-medium">
                  Click on the preview strip under the book cover photo above to load other pages in HD resolution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {allImages.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setActiveImageIndex(i);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="group aspect-[3/4] rounded-2xl overflow-hidden border border-[#CED7DF] shadow-xs cursor-pointer relative"
                  >
                    <img src={img} className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" alt="" />
                    <div className="absolute inset-0 bg-[#071E38]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-[#071E38] font-black text-[10px] uppercase px-3 py-1.5 rounded-lg font-heading shadow">
                        Load in main viewer
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FAQS ACCORDION */}
          {activeTab === 'faqs' && (
            <div className="space-y-4 max-w-4xl animate-in fade-in duration-200">
              <h4 className="text-base sm:text-lg font-black text-[#0B3561] font-heading mb-4">
                Frequently Asked Questions (FAQs)
              </h4>

              {[
                {
                  q: "What is the paper quality and layout design?",
                  a: "All PyNotes are printed professionally on brilliant white, ultra-thick 100 GSM non-bleed paper. Even if you use heavy fluorescent text highlighters, the ink will not seep or bleed onto the reverse page. The wire-spiral lay-flat binding allows you to keep it open on your study desk while typing out code."
                },
                {
                  q: "Is Cash on Delivery (COD) supported?",
                  a: "Yes! Cash on Delivery is supported across 19,000+ pin codes across India. You can pay securely with cash or any UPI app (GPay, PhonePe, Paytm) right to the courier rider at your doorstep."
                },
                {
                  q: "How many days does shipping and delivery take?",
                  a: "Orders are processed and dispatched within 24 hours from our fulfillment centers in Delhi or Bangalore. Deliveries to tier-1 cities (such as Delhi, Bangalore, Mumbai, Chennai, Hyderabad, Pune) take 2-4 business days. Other states and cities take 3-5 business days."
                },
                {
                  q: "What is your damage replacement guarantee?",
                  a: "We offer a 48-Hour No-Questions-Asked Damaged Replacement Guarantee. If your book arrives with transit damage, folded edges, or printing errors, simply submit a claim inside the My Account section, and we will dispatch a brand-new copy free of charge."
                },
                {
                  q: "Are these notes enough for engineering exams and placements?",
                  a: "Yes. They are structured chapter-by-chapter and cover 100% of the core theoretical and practical questions asked in semester exams and technical SDE placement rounds. They are perfect for fast revisions."
                }
              ].map((faq, fIdx) => (
                <div key={fIdx} className="p-4 rounded-2xl bg-[#F7FAFC] border border-[#CED7DF]">
                  <div className="font-extrabold text-[#0B3561] text-xs sm:text-sm font-heading flex items-start gap-2">
                    <span className="text-[#12A5B0] font-black">Q.</span>
                    <span>{faq.q}</span>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-[#3C5D81] font-semibold pl-4 leading-relaxed border-l border-[#A0DBDF]">
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 4. VERIFIED REVIEWS SECTION */}
      <div className="mt-8 bg-white rounded-3xl border border-[#CED7DF] p-5 sm:p-8 lg:p-10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E7EBEF]">
          <div>
            <h3 className="text-xl font-black text-[#0B3561] font-heading">
              Student Placement & Exam Reviews
            </h3>
            <p className="text-[#6D86A0] text-xs mt-1">
              Real engineering placement feedback from verified buyers across India.
            </p>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-[#DDF3F4] hover:bg-[#c2ebed] text-[#0B3561] px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer font-heading uppercase tracking-wider shrink-0 self-start sm:self-auto"
          >
            {showReviewForm ? 'Cancel' : '✍️ Write a verified Review'}
          </button>
        </div>

        {/* Review form */}
        {showReviewForm && (
          <form
            onSubmit={handleSubmitReview}
            className="mb-8 p-5 bg-[#F7FAFC] rounded-2xl border border-[#CED7DF] space-y-4 max-w-3xl animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <div className="font-bold text-base text-[#0B3561] font-heading">
              Share Your Learning Experience
            </div>
            {reviewError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your Full Name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="bg-white border border-[#CED7DF] rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#12A5B0] font-bold text-[#0B3561]"
                required
              />
              <input
                type="text"
                placeholder="College / Company (e.g. NIT / SDE Intern)"
                value={reviewerCollege}
                onChange={(e) => setReviewerCollege(e.target.value)}
                className="bg-white border border-[#CED7DF] rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#12A5B0] font-semibold text-[#0B3561]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#0B3561]">Star Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="cursor-pointer transition-transform hover:scale-110 animate-duration-100"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewRating
                        ? 'fill-[#FFD54A] text-[#FFD54A]'
                        : 'text-[#CED7DF]'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              placeholder="How did this hand-drawn core notes guide help your study sessions, exams, or SDE interview preparation?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              className="w-full bg-white border border-[#CED7DF] rounded-xl p-3 text-xs focus:outline-hidden focus:border-[#12A5B0] font-medium leading-relaxed"
              required
            />
            <button
              type="submit"
              className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-black px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer font-heading uppercase tracking-wider"
            >
              Post Review
            </button>
          </form>
        )}

        {/* Reviews list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {productReviews.length > 0 ? (
            productReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#CED7DF] space-y-3 flex flex-col justify-between hover:bg-white transition-all hover:shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#12A5B0]/20 text-[#0B3561] font-black text-sm flex items-center justify-center font-heading">
                        {rev.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-[#0B3561] flex items-center gap-1.5 font-heading">
                          <span>{rev.customerName}</span>
                          {rev.verified && (
                            <span className="text-[9px] bg-[#DDF3F4] text-[#12A5B0] px-2 py-0.5 rounded-full font-black uppercase">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        {rev.college && (
                          <div className="text-[10px] font-semibold text-[#6D86A0]">{rev.college}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex text-[#FFD54A]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#FFD54A] text-[#FFD54A]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#3C5D81] leading-relaxed italic font-body">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
                <div className="text-[10px] text-[#9DAEC0] font-mono pt-1">{rev.date}</div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-[#9DAEC0] text-xs font-semibold">
              Be the first to review this book! Share your placement & exam prep feedback.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
