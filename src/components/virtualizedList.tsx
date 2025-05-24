import React, { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
interface VirtualizedListProps {
  items: string[];
}

// ========================
// 4. 虛擬化 - 處理大量數據
// ========================
export const VirtualizedList = ({ items }: VirtualizedListProps) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef(null);
  const itemHeight = 50;
  const containerHeight = 300;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = (e.target as HTMLDivElement).scrollTop;
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(
        start + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
      );

      console.log("start end: ", { start, end });
      setVisibleRange({ start, end });
    },
    [items.length]
  );

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  return (
    <div className="mb-4">
      <h3 className="font-bold mb-2">虛擬化列表 (共 {items.length} 項)</h3>
      <Link href="/virtualized-list-page" className=" font-bold">
        前往虛擬化列表比較頁面 →
      </Link>

      <div
        ref={containerRef}
        className="border border-gray-300 overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div
          style={{ height: items.length * itemHeight, position: "relative" }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              className="absolute w-full p-2 border-b border-gray-100"
              style={{
                top: (visibleRange.start + index) * itemHeight,
                height: itemHeight,
              }}
            >
              項目 {visibleRange.start + index + 1}: {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
