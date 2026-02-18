import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { motion, useAnimation } from "framer-motion";
import { serverurl } from "../App.jsx";
import { IoMdCart } from "react-icons/io";

// Ultimate super-animated ITEMCARD slider for e-laundry
// - infinite auto-scroll (mouse-hover pauses)
// - magnetic 3D tilt per-card (mouse position)
// - image parallax + holographic sweep
// - neon-green premium scrollbar
// - fly-to-cart micro-animation (visual) when add pressed
// - accessible buttons, reduced-motion respect

export default function ITEMCARD() {
  const [items, setitems] = useState([]);
  const [loading, setloading] = useState(true);
  const sliderRef = useRef(null);
  const tickerRef = useRef(null);
  const isHoveringRef = useRef(false);
  const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // fly to cart animation elements
  const flyLayerRef = useRef(null);
  const cartRef = useRef(null);

  // fetch items
  useEffect(() => {
    let mounted = true;
    const fetchitems = async () => {
      try {
        const res = await axios.get(`${serverurl}/item/all`);
        if (!mounted) return;
        setitems(res.data.data || []);
        setloading(false);
      } catch (err) {
        console.log(err?.response?.data || err?.response?.message || err);
        setloading(false);
      }
    };
    fetchitems();
    return () => (mounted = false);
  }, []);

  // AUTO-SCROLL / INFINITE LOOP
  // we duplicate the list visually to make it feel infinite
  const visibleItems = [...items, ...items];

  const startTicker = useCallback(() => {
    if (prefersReduced) return; // don't auto animate if user prefers reduced motion
    const slider = sliderRef.current;
    if (!slider) return;
    let speed = 0.45; // px per frame baseline
    let rafId;

    const step = () => {
      if (!slider) return;
      if (!isHoveringRef.current) {
        slider.scrollLeft += speed;
        // when reach half, reset back by original length
        const half = slider.scrollWidth / 2;
        if (slider.scrollLeft >= half) {
          slider.scrollLeft -= half;
        }
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    tickerRef.current = rafId;
  }, [prefersReduced]);

  const stopTicker = useCallback(() => {
    if (tickerRef.current) cancelAnimationFrame(tickerRef.current);
    tickerRef.current = null;
  }, []);

  useEffect(() => {
    startTicker();
    return () => stopTicker();
  }, [startTicker, stopTicker]);

  // hover handlers for pause
  const onEnterSlider = () => (isHoveringRef.current = true);
  const onLeaveSlider = () => (isHoveringRef.current = false);

  // --- FLY TO CART micro-animation ---
  const flyToCart = (imgSrc, fromRect) => {
    if (!flyLayerRef.current || !cartRef.current) return;
    try {
      const node = document.createElement("div");
      node.className = "absolute z-[200] pointer-events-none rounded-xl overflow-hidden shadow-2xl";
      node.style.width = `${Math.min(fromRect.width, 120)}px`;
      node.style.height = `${Math.min(fromRect.height, 120)}px`;
      node.style.left = `${fromRect.left}px`;
      node.style.top = `${fromRect.top}px`;
      node.style.transition = "all 700ms cubic-bezier(0.22, 1, 0.36, 1)";
      node.style.willChange = "transform, left, top, opacity";

      const img = document.createElement("img");
      img.src = imgSrc || "";
      img.className = "w-full h-full object-cover rounded-lg";
      node.appendChild(img);
      flyLayerRef.current.appendChild(node);

      const cartRect = cartRef.current.getBoundingClientRect();
      // small delay to ensure appended
      requestAnimationFrame(() => {
        node.style.left = `${cartRect.left + cartRect.width / 2 - fromRect.width / 4}px`;
        node.style.top = `${cartRect.top + cartRect.height / 2 - fromRect.height / 4}px`;
        node.style.transform = "scale(0.22) rotate(12deg)";
        node.style.opacity = "0.03";
      });

      setTimeout(() => {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      }, 900);
    } catch (err) {
      console.log("flyToCart error", err);
    }
  };

  // ----------------- CARD UI -----------------
  // magnetic tilt calculations: returns style transform string
  const calcTilt = (e, cardEl, strength = 18) => {
    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within card
    const y = e.clientY - rect.top; // y position within card
    const px = (x / rect.width) * 2 - 1; // -1 .. 1
    const py = (y / rect.height) * 2 - 1; // -1 .. 1
    const tiltX = -py * strength; // rotateX
    const tiltY = px * strength; // rotateY
    const translateX = -px * (strength / 6);
    const translateY = -py * (strength / 6);
    return `perspective(900px) translate3d(${translateX}px, ${translateY}px, 0px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  };

  // accessible button handler - placeholder for real add-to-cart dispatch
  const handleAdd = (item, e) => {
    // micro visual: find image element and animate to cart
    const cardEl = e.currentTarget.closest(".card-root");
    const img = cardEl?.querySelector("img");
    if (img) {
      const rect = img.getBoundingClientRect();
      flyToCart(img.src, rect);
    }
    // TODO: dispatch redux action or call parent callback
    // console.log("add to cart", item._id)
  };

  // Render single card
  const renderCard = (it, i) => {
    return (
      <motion.div
        key={`${it._id}-${i}`}
        className="card-root relative w-72 min-w-[18rem] h-[340px] rounded-3xl bg-white/90 border border-green-100 shadow-xl overflow-hidden flex-shrink-0"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (i % (items.length || 1)) * 0.06, duration: 0.45 }}
        onMouseMove={(e) => {
          const el = e.currentTarget;
          el.style.transform = calcTilt(e, el, 14);
          // parallax image move
          const img = el.querySelector(".card-image");
          if (img) {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            img.style.transform = `translate3d(${px * 16}px, ${py * 12}px, 0) scale(1.06)`;
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "perspective(900px) translate3d(0,0,0) rotateX(0) rotateY(0)";
          const img = el.querySelector(".card-image");
          if (img) img.style.transform = "translate3d(0,0,0) scale(1)";
        }}
        role="article"
        aria-label={`${it.name} laundry item`}>

        {/* top glow bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-700"></div>

        {/* image area */}
        <div className="w-full h-52 relative overflow-hidden">
          <img
            src={it.image}
            alt={it.name}
            className="card-image w-full h-full object-cover transition-transform duration-700"
            draggable={false}
          />

          {/* holographic sweep */}
          <motion.div
            className="absolute inset-0 opacity-0 pointer-events-none"
            animate={{ opacity: [0, 0.18, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: (i % 5) * 0.6 }}
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)", mixBlendMode: "overlay" }}
          />

          {/* Veg badge example (keeps design language) */}
          <div className="absolute top-4 left-4 bg-white/10 backdrop-blur rounded-full px-3 py-1 border border-white/20 text-sm text-white font-semibold">
            <span className="flex items-center gap-2">
              <IoMdCart className="text-green-200" /> <span>Laundry</span>
            </span>
          </div>
        </div>

        {/* info area */}
        <div className="p-4 flex flex-col gap-3 h-[128px] justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 truncate">{it.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-green-700 font-extrabold">৳ {it.price}</span>
              <span className="text-sm text-gray-500">Washing: ৳ {it.washingprice}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => handleAdd(it, e)}
              className="relative flex-1 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
              aria-label={`Add ${it.name} to cart`}
            >
              Add to Cart
            </button>

            <button
              onClick={() => window.alert(`Quick view: ${it.name}`)}
              className="px-3 py-2 rounded-lg border border-green-100 bg-white text-green-700 font-medium shadow-sm"
              aria-label={`Quick view ${it.name}`}
            >
              Quick
            </button>
          </div>
        </div>

        {/* subtle neon bottom stroke */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60" />
      </motion.div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-green-700">Our Luxury Laundry Items</h1>
            <p className="text-sm text-gray-500 mt-1">Premium quality | fast wash | eco-friendly detergents</p>
          </div>

          <div className="flex items-center gap-4">
            <div ref={cartRef} className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md border border-green-50">
              <IoMdCart className="text-green-600 text-2xl" />
            </div>
          </div>
        </header>

        {/* loading shimmer */}
        {loading && (
          <div className="flex gap-6 overflow-x-auto py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-72 h-72 bg-gray-200 animate-pulse rounded-3xl flex-shrink-0"></div>
            ))}
          </div>
        )}

        {/* slider */}
        {!loading && (
          <div
            onMouseEnter={onEnterSlider}
            onMouseLeave={onLeaveSlider}
            className="relative"
          >
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-scroll no-scrollbar py-4 px-2"
              style={{ scrollBehavior: "smooth" }}
            >
              {visibleItems.map((it, i) => renderCard(it, i))}
            </div>

            {/* custom scrollbar (only visible on webkit browsers) */}
            <style>{`
              .no-scrollbar::-webkit-scrollbar { height: 12px }
              .no-scrollbar::-webkit-scrollbar-track { background: transparent }
              .no-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(90deg,#16a34a,#22c55e);
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(34,197,94,0.25);
              }
              .no-scrollbar { scrollbar-width: thin; scrollbar-color: #16a34a transparent }
            `}</style>
          </div>
        )}

        {/* fly-to-cart visual layer (portal) */}
        <div ref={flyLayerRef} className="pointer-events-none fixed inset-0 z-[200]" />

        {/* accessibility: respects reduced motion by stopping auto animations */}
        {prefersReduced && (
          <div className="mt-6 text-sm text-gray-500">Reduced motion enabled — animations minimized.</div>
        )}
      </div>
    </div>
  );
}
