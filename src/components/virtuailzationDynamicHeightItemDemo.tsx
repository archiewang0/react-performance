"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  RefObject,
} from "react";

interface Item {
  id: number;
  name: string;
  content: string;
  priority: string;
  category: string;
}

// 生成隨機內容長度的測試數據
const generateTestData = (count: number): Item[] => {
  const contentVariations = [
    "簡短內容",
    "這是一個中等長度的內容，包含更多的文字描述和詳細信息。",
    "這是一個非常長的內容描述，包含了大量的文字信息，可能會跨越多行顯示，用來測試動態高度的虛擬化列表實現效果。這種長內容在實際應用中很常見，比如社交媒體的貼文、商品的詳細描述、用戶評論等場景。",
    "中長度內容，包含一些關鍵信息和額外的描述文字，但不會太長。",
    "超級長的內容示例：在現代前端開發中，虛擬化是處理大量數據展示的重要技術。特別是當我們需要展示成千上萬條記錄時，傳統的全部渲染方式會導致嚴重的性能問題。虛擬化技術通過只渲染可見區域的項目，大大提升了應用的性能表現。",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `項目 ${i + 1}`,
    content:
      contentVariations[Math.floor(Math.random() * contentVariations.length)],
    priority: ["低", "中", "高", "緊急"][Math.floor(Math.random() * 4)],
    category: ["開發", "設計", "測試", "文檔"][Math.floor(Math.random() * 4)],
  }));
};

// 固定高度虛擬化（會有問題）
const FixedHeightVirtualization = ({ items }: { items: Item[] }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerHeight = 400;
  const fixedItemHeight = 80; // 假設固定高度
  const containerRef = useRef(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / fixedItemHeight);
    const visibleCount = Math.ceil(containerHeight / fixedItemHeight);
    const end = Math.min(start + visibleCount + 2, items.length - 1);
    return { start, end };
  }, [scrollTop, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  const totalHeight = items.length * fixedItemHeight;
  const offsetY = visibleRange.start * fixedItemHeight;

  return (
    <div className="bg-white border rounded-lg">
      <div className="p-4 border-b bg-red-50">
        <h4 className="font-bold text-red-800">❌ 固定高度虛擬化（有問題）</h4>
        <div className="text-sm text-red-600 mt-1">
          假設每項高度 {fixedItemHeight}px - 但實際高度會變動
        </div>
        <div className="text-xs text-red-500 mt-1">
          ⚠️ 滾動條位置不準確、項目重疊或間距錯誤
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item, index) => (
              <div
                key={visibleRange.start + index}
                className="absolute w-full p-4 border-b border-gray-200 bg-white"
                style={{
                  top: index * fixedItemHeight,
                  minHeight: fixedItemHeight,
                }}
              >
                <DynamicHeightItem item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 動態高度項目組件
const DynamicHeightItem = ({ item }: { item: Item }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-gray-800">{item.name}</h4>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 text-xs rounded ${
              item.priority === "緊急"
                ? "bg-red-100 text-red-800"
                : item.priority === "高"
                ? "bg-orange-100 text-orange-800"
                : item.priority === "中"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {item.priority}
          </span>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
            {item.category}
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{item.content}</p>
    </div>
  );
};

// 動態高度虛擬化解決方案
const DynamicHeightVirtualization = ({ items }: { items: Item[] }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState(new Map());
  const [itemPositions, setItemPositions] = useState<number[]>([]);
  const containerHeight = 400;
  const estimatedItemHeight = 80; // 估算高度
  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());

  // 計算累積位置
  useEffect(() => {
    const positions: number[] = [];
    let accumulatedHeight = 0;

    for (let i = 0; i < items.length; i++) {
      positions[i] = accumulatedHeight;
      const itemHeight = itemHeights.get(i) || estimatedItemHeight;
      accumulatedHeight += itemHeight;
    }

    setItemPositions(positions);
  }, [items.length, itemHeights, estimatedItemHeight]);

  // 測量項目實際高度
  const measureItem = useCallback(
    (index: number, element: HTMLDivElement | null) => {
      if (element) {
        const height = element.getBoundingClientRect().height;
        setItemHeights((prev) => {
          const newMap = new Map(prev);
          if (newMap.get(index) !== height) {
            newMap.set(index, height);
            return newMap;
          }
          return prev;
        });
      }
    },
    []
  );

  // 使用二分搜尋找到可見範圍
  const visibleRange = useMemo(() => {
    if (itemPositions.length === 0) {
      return { start: 0, end: Math.min(10, items.length - 1) };
    }

    // 二分搜尋找到起始位置
    let start = 0;
    let end = itemPositions.length - 1;

    while (start < end) {
      const mid = Math.floor((start + end) / 2);
      if (itemPositions[mid] < scrollTop) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }

    const startIndex = Math.max(0, start - 1);

    // 找到結束位置
    let endIndex = startIndex;
    let currentHeight = itemPositions[startIndex] || 0;

    while (
      endIndex < items.length &&
      currentHeight < scrollTop + containerHeight + 100
    ) {
      const itemHeight = itemHeights.get(endIndex) || estimatedItemHeight;
      currentHeight += itemHeight;
      endIndex++;
    }

    return {
      start: startIndex,
      end: Math.min(endIndex, items.length - 1),
    };
  }, [
    scrollTop,
    itemPositions,
    itemHeights,
    items.length,
    containerHeight,
    estimatedItemHeight,
  ]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  const totalHeight = useMemo(() => {
    if (itemPositions.length === 0) return items.length * estimatedItemHeight;
    const lastIndex = items.length - 1;
    const lastPosition = itemPositions[lastIndex] || 0;
    const lastHeight = itemHeights.get(lastIndex) || estimatedItemHeight;
    return lastPosition + lastHeight;
  }, [itemPositions, itemHeights, items.length, estimatedItemHeight]);

  return (
    <div className="bg-white border rounded-lg">
      <div className="p-4 border-b bg-green-50">
        <h4 className="font-bold text-green-800">
          ✅ 動態高度虛擬化（正確實現）
        </h4>
        <div className="text-sm text-green-600 mt-1">
          測量實際高度並動態調整位置
        </div>
        <div className="text-xs text-green-500 mt-1 space-x-4">
          <span>總高度: {totalHeight.toFixed(0)}px</span>
          <span>
            可見項目: {visibleRange.start}-{visibleRange.end}
          </span>
          <span>
            已測量: {itemHeights.size}/{items.length}
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            const top = itemPositions[actualIndex] || 0;

            return (
              <div
                key={actualIndex}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(actualIndex, el);
                    measureItem(actualIndex, el);
                  }
                }}
                className="absolute w-full p-4 border-b border-gray-200 bg-white"
                style={{ top }}
              >
                <DynamicHeightItem item={item} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 改進版：使用 ResizeObserver 的方案
const AdvancedDynamicVirtualization = ({ items }: { items: Item[] }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemMetrics, setItemMetrics] = useState(new Map());
  const containerHeight = 400;
  const estimatedItemHeight = 80;
  const containerRef = useRef(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 初始化 ResizeObserver
  useEffect(() => {
    // ResizeObserver??
    resizeObserverRef.current = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        const updates = new Map();

        entries.forEach((entry) => {
          const index = parseInt(
            (entry.target as HTMLElement).dataset.index || "0"
          );
          const height = entry.contentRect.height;
          updates.set(index, height);
        });

        if (updates.size > 0) {
          setItemMetrics((prev) => {
            const newMap = new Map(prev);
            updates.forEach((height, index) => {
              newMap.set(index, height);
            });
            return newMap;
          });
        }
      }
    );

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // 計算項目位置
  const itemPositions = useMemo(() => {
    const positions = [];
    let offset = 0;

    for (let i = 0; i < items.length; i++) {
      positions[i] = offset;
      const height = itemMetrics.get(i) || estimatedItemHeight;
      offset += height;
    }

    return positions;
  }, [items.length, itemMetrics, estimatedItemHeight]);

  // 計算可見範圍
  const visibleRange = useMemo(() => {
    if (itemPositions.length === 0) return { start: 0, end: 10 };

    // 二分搜尋優化
    const findIndex = (position: number) => {
      let start = 0;
      let end = itemPositions.length - 1;

      while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        if (itemPositions[mid] === position) return mid;
        if (itemPositions[mid] < position) start = mid + 1;
        else end = mid - 1;
      }
      return start;
    };

    const startIndex = Math.max(0, findIndex(scrollTop) - 1);
    let endIndex = startIndex;

    while (
      endIndex < items.length &&
      itemPositions[endIndex] < scrollTop + containerHeight + 200
    ) {
      endIndex++;
    }

    return { start: startIndex, end: Math.min(endIndex, items.length - 1) };
  }, [scrollTop, itemPositions, items.length, containerHeight]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end + 1);
  const totalHeight =
    itemPositions.length > 0
      ? itemPositions[itemPositions.length - 1] +
        (itemMetrics.get(items.length - 1) || estimatedItemHeight)
      : items.length * estimatedItemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  return (
    <div className="bg-white border rounded-lg">
      <div className="p-4 border-b bg-blue-50">
        <h4 className="font-bold text-blue-800">
          🚀 ResizeObserver 方案（最佳實現）
        </h4>
        <div className="text-sm text-blue-600 mt-1">
          使用 ResizeObserver 自動監測高度變化
        </div>
        <div className="text-xs text-blue-500 mt-1 space-x-4">
          <span>動態測量: {itemMetrics.size} 項目</span>
          <span>總高度: {totalHeight.toFixed(0)}px</span>
          <span>
            渲染範圍: {visibleRange.start}-{visibleRange.end}
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            const top = itemPositions[actualIndex] || 0;

            return (
              <div
                key={actualIndex}
                data-index={actualIndex}
                ref={(el) => {
                  if (el && resizeObserverRef.current) {
                    resizeObserverRef.current.observe(el);
                  }
                }}
                className="absolute w-full p-4 border-b border-gray-200 bg-white"
                style={{ top }}
              >
                <DynamicHeightItem item={item} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 主要比較組件
export function DynamicHeightComparison() {
  const [dataSize, setDataSize] = useState(1000);
  const testData = useMemo(() => generateTestData(dataSize), [dataSize]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          📏 動態高度虛擬化解決方案
        </h1>
        <p className="text-lg text-gray-600">
          當項目高度不固定時，虛擬化實現的挑戰與解決方案
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <label className="block text-sm font-medium text-gray-700">
            數據量：
          </label>
          <select
            value={dataSize}
            onChange={(e) => setDataSize(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value={100}>100 項</option>
            <option value={500}>500 項</option>
            <option value={1000}>1,000 項</option>
            <option value={2000}>2,000 項</option>
          </select>
          <span className="text-sm text-gray-500">
            高度範圍: 60px - 120px（根據內容動態調整）
          </span>
        </div>
      </div>

      {/* 問題說明 */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
        <h3 className="font-bold text-red-800 mb-3">🚨 動態高度的挑戰</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">主要問題：</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• 無法預知每個項目的確切高度</li>
              <li>• 滾動條總高度計算不準確</li>
              <li>• 項目位置計算錯誤</li>
              <li>• 可能出現項目重疊或間隙</li>
              <li>• 滾動跳躍現象</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">解決策略：</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• 動態測量實際高度</li>
              <li>• 維護累積位置映射</li>
              <li>• 使用二分搜尋優化查找</li>
              <li>• ResizeObserver 監測變化</li>
              <li>• 預估高度 + 實測修正</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 三種實現方案對比 */}
      <div className="space-y-6">
        <FixedHeightVirtualization items={testData} />
        <DynamicHeightVirtualization items={testData} />
        <AdvancedDynamicVirtualization items={testData} />
      </div>

      {/* 實現原理詳解 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h3 className="font-bold text-lg mb-4">🔧 實現原理詳解</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-green-600 mb-3">
                ✅ 正確的實現步驟
              </h4>
              <ol className="text-sm space-y-2 text-gray-700">
                <li>
                  <strong>1. 預估高度：</strong> 設定一個估算的平均高度
                </li>
                <li>
                  <strong>2. 動態測量：</strong> 渲染時測量每個項目的實際高度
                </li>
                <li>
                  <strong>3. 位置映射：</strong> 維護每個項目的累積位置
                </li>
                <li>
                  <strong>4. 二分搜尋：</strong> 快速找到可見範圍
                </li>
                <li>
                  <strong>5. 自動更新：</strong> 高度變化時重新計算
                </li>
              </ol>
            </div>

            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-red-600 mb-3">❌ 常見錯誤</h4>
              <ul className="text-sm space-y-2 text-gray-700">
                <li>• 假設所有項目高度相同</li>
                <li>• 不測量實際渲染高度</li>
                <li>• 使用固定高度計算位置</li>
                <li>• 忽略內容變化導致的高度變化</li>
                <li>• 沒有處理圖片載入等異步情況</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold mb-3">📊 性能優化技巧</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-600 mb-2">測量優化</h5>
                <ul className="space-y-1 text-gray-700">
                  <li>• 使用 ResizeObserver</li>
                  <li>• 批量測量避免重排</li>
                  <li>• 快取測量結果</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-600 mb-2">計算優化</h5>
                <ul className="space-y-1 text-gray-700">
                  <li>• 二分搜尋可見範圍</li>
                  <li>• 累積位置預計算</li>
                  <li>• useMemo 記憶化</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-purple-600 mb-2">渲染優化</h5>
                <ul className="space-y-1 text-gray-700">
                  <li>• 緩衝區預渲染</li>
                  <li>• 避免頻繁重新渲染</li>
                  <li>• 使用 transform 定位</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 實際應用建議 */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="font-bold text-yellow-800 mb-3">💡 實際應用建議</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
          <div>
            <h4 className="font-semibold mb-2">適用場景：</h4>
            <ul className="space-y-1">
              <li>• 社交媒體動態（內容長短不一）</li>
              <li>• 評論系統（回覆層級不同）</li>
              <li>• 商品列表（圖片大小不一）</li>
              <li>• 聊天記錄（訊息長短差異大）</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">開源解決方案：</h4>
            <ul className="space-y-1">
              <li>• react-window（支援動態高度）</li>
              <li>• react-virtualized（功能完整）</li>
              <li>• @tanstack/react-virtual（現代化）</li>
              <li>• 自定義實現（完全控制）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
