"use client";
import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";

declare global {
  interface Performance {
    memory: {
      usedJSHeapSize: number;
    };
  }
}

interface ResultsItem {
  itemCount: number;
  renderTime: number;
  memoryUsed: number;
  wouldCauseJank: boolean;
}

// 性能測試工具
const PerformanceTester = () => {
  const [testResults, setTestResults] = useState<ResultsItem[]>([]);
  const [isTestingPerformance, setIsTestingPerformance] = useState(false);

  const performanceTest = async () => {
    setIsTestingPerformance(true);
    const results = [];

    // 測試不同數量的渲染性能
    for (const itemCount of [100, 500, 1000, 5000, 10000]) {
      const startTime = performance.now();
      const startMemory = performance.memory?.usedJSHeapSize || 0;

      // 模擬 DOM 渲染時間
      await new Promise((resolve) => {
        const items = Array.from({ length: itemCount }, (_, i) => i);
        // 模擬渲染複雜度
        const complexCalculation = items.reduce((acc, item) => {
          return acc + Math.sqrt(item * 2);
        }, 0);

        setTimeout(resolve, 10); // 模擬渲染延遲
      });

      const endTime = performance.now();
      const endMemory = performance.memory?.usedJSHeapSize || 0;

      results.push({
        itemCount,
        renderTime: endTime - startTime,
        memoryUsed: (endMemory - startMemory) / 1024, // KB
        wouldCauseJank: endTime - startTime > 16, // 60fps = 16.67ms per frame
      });
    }

    setTestResults(results);
    setIsTestingPerformance(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg border mb-6">
      <h3 className="font-bold text-lg mb-4">🔬 渲染性能測試</h3>

      <button
        onClick={performanceTest}
        disabled={isTestingPerformance}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4"
      >
        {isTestingPerformance ? "測試中..." : "開始性能測試"}
      </button>

      {testResults.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">項目數量</th>
                <th className="p-2 text-left">渲染時間</th>
                <th className="p-2 text-left">記憶體使用</th>
                <th className="p-2 text-left">性能狀態</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2 font-mono">
                    {result.itemCount.toLocaleString()}
                  </td>
                  <td className="p-2 font-mono">
                    {result.renderTime.toFixed(2)}ms
                  </td>
                  <td className="p-2 font-mono">
                    {result.memoryUsed.toFixed(2)}KB
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        result.wouldCauseJank
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {result.wouldCauseJank ? "❌ 可能卡頓" : "✅ 流暢"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

interface TraditionalListProps {
  showAll?: boolean;
  items: Item[];
}

interface Item {
  id: number;
  name: string;
  description: string;
}

// 傳統列表（會造成性能問題）
const TraditionalList = ({ items, showAll = false }: TraditionalListProps) => {
  const [renderTime, setRenderTime] = useState(0);
  const displayItems = showAll ? items : items.slice(0, 50);

  useEffect(() => {
    const startTime = performance.now();

    // 模擬渲染完成後的時間測量
    const timer = setTimeout(() => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    }, 0);

    return () => clearTimeout(timer);
  }, [displayItems.length]);

  return (
    <div className="bg-white border rounded-lg">
      <div className="p-4 border-b bg-red-50">
        <h4 className="font-bold text-red-800">❌ 傳統列表渲染</h4>
        <div className="text-sm text-red-600 mt-1">
          渲染 {displayItems.length.toLocaleString()} 項 - 渲染時間:{" "}
          {renderTime.toFixed(2)}ms
        </div>
        {displayItems.length > 1000 && (
          <div className="text-xs text-red-500 mt-1">
            ⚠️ 超過1000項可能造成明顯卡頓
          </div>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="p-3 border-b border-gray-100 hover:bg-gray-50"
          >
            <div className="font-medium">項目 {item.id}</div>
            <div className="text-sm text-gray-600">{item.name}</div>
            <div className="text-xs text-gray-400">
              描述: {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface VirtualizedListPrsop {
  items: Item[];
}

// 虛擬化列表（優化版本）
const VirtualizedList = ({ items }: VirtualizedListPrsop) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight] = useState(300);
  const [itemHeight] = useState(60);
  const containerRef = useRef(null);

  // 計算可見範圍
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 2, items.length - 1); // +2 為緩衝區

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  // 只渲染可見項目
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div className="bg-white border rounded-lg">
      <div className="p-4 border-b bg-green-50">
        <h4 className="font-bold text-green-800">✅ 虛擬化列表</h4>
        <div className="text-sm text-green-600 mt-1">
          總項目: {items.length.toLocaleString()} | 實際渲染:{" "}
          {visibleItems.length} | 渲染比例:{" "}
          {((visibleItems.length / items.length) * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-green-500 mt-1">
          💡 只渲染可見區域，記憶體使用恆定
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
                className="absolute w-full p-3 border-b border-gray-100 hover:bg-gray-50"
                style={{
                  top:
                    (visibleRange.start + index - visibleRange.start) *
                    itemHeight,
                  height: itemHeight,
                }}
              >
                <div className="font-medium">項目 {item.id}</div>
                <div className="text-sm text-gray-600">{item.name}</div>
                <div className="text-xs text-gray-400">
                  位置: {visibleRange.start + index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 比較組件
const PerformanceComparison = () => {
  const [dataSize, setDataSize] = useState(1000);
  const [showTraditionalAll, setShowTraditionalAll] = useState(false);

  // 生成測試數據
  const testData = useMemo(() => {
    console.log(`生成 ${dataSize} 筆測試資料...`);
    return Array.from({ length: dataSize }, (_, i) => ({
      id: i + 1,
      name: `項目 ${i + 1}`,
      description: `這是第 ${i + 1} 個項目的詳細描述內容`,
    }));
  }, [dataSize]);

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-bold mb-3">📊 性能比較控制台</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <option value={5000}>5,000 項</option>
              <option value={10000}>10,000 項</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showAll"
              checked={showTraditionalAll}
              onChange={(e) => setShowTraditionalAll(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showAll" className="text-sm text-gray-700">
              傳統列表顯示全部（⚠️ 小心卡頓）
            </label>
          </div>
        </div>
      </div>

      {/* 性能測試 */}
      <PerformanceTester />

      {/* 對比展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TraditionalList items={testData} showAll={showTraditionalAll} />
        <VirtualizedList items={testData} />
      </div>

      {/* 原理說明 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h3 className="font-bold text-lg mb-4">🧠 虛擬化原理詳解</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-red-600 mb-2">
              ❌ 傳統方式問題：
            </h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 渲染所有 DOM 元素（如10000個div）</li>
              <li>• 記憶體使用量隨數據量線性增長</li>
              <li>• 初始渲染時間長</li>
              <li>• 滾動時重新計算所有元素位置</li>
              <li>• 瀏覽器需要維護大量 DOM 節點</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-green-600 mb-2">
              ✅ 虛擬化優勢：
            </h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 只渲染可見區域的項目（約10-20個）</li>
              <li>• 記憶體使用量恆定</li>
              <li>• 快速初始載入</li>
              <li>• 滾動流暢，無卡頓</li>
              <li>• 支援百萬級數據</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded border">
          <h4 className="font-semibold mb-2">📝 核心實現原理：</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <div>
              <strong>1. 計算可見範圍：</strong>{" "}
              根據滾動位置和容器高度計算需要顯示的項目範圍
            </div>
            <div>
              <strong>2. 切片渲染：</strong> 使用{" "}
              <code className="bg-gray-100 px-1 rounded">
                items.slice(start, end)
              </code>{" "}
              只取需要的數據
            </div>
            <div>
              <strong>3. 位置計算：</strong> 使用{" "}
              <code className="bg-gray-100 px-1 rounded">
                transform: translateY()
              </code>{" "}
              定位可見項目
            </div>
            <div>
              <strong>4. 滾動監聽：</strong> 監聽滾動事件，動態更新可見範圍
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">
            💡 實際應用場景：
          </h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>• 表格數據 (如 Excel 般的大型數據表)</div>
            <div>• 聊天記錄 (微信、Line 等應用)</div>
            <div>• 商品列表 (電商網站的大量商品)</div>
            <div>• 日誌查看器 (開發工具的 console)</div>
            <div>• 文件列表 (如 Google Drive)</div>
          </div>
        </div>
      </div>

      {/* 代碼範例 */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="font-bold mb-4">💻 關鍵代碼實現</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-red-600 mb-2">❌ 傳統方式：</h4>
            <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
              {`// 渲染所有項目 - 會造成性能問題
{items.map((item, index) => (
  <div key={index}>
    {item.name}
  </div>
))}

// 問題：
// - 10000個項目 = 10000個DOM元素
// - 記憶體使用量: ~50MB+
// - 初始渲染時間: 500ms+`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-green-600 mb-2">
              ✅ 虛擬化方式：
            </h4>
            <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
              {`// 只渲染可見項目
const visibleItems = useMemo(() => {
  const start = Math.floor(scrollTop / itemHeight);
  const end = start + visibleCount;
  return items.slice(start, end);
}, [scrollTop, items]);

// 優勢：
// - 10000個項目 只渲染 ~20個DOM元素
// - 記憶體使用量: ~2MB
// - 初始渲染時間: <50ms`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VirtualizationDemo() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🚀 虛擬化技術深度解析
        </h1>
        <p className="text-lg text-gray-600">
          理解為什麼大量數據會造成卡頓，以及虛擬化如何解決這個問題
        </p>
      </div>

      <PerformanceComparison />
    </div>
  );
}
