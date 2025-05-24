"use client";
import { useState, useMemo, useCallback } from "react";
import { ExpensiveChild } from "@/components/expensiveChild";
import { ExpensiveCalculation } from "@/components/expensiveCalculation";
import { UserList } from "@/components/userList";
import { VirtualizedList } from "@/components/virtualizedList";
import { LazyImage } from "@/components/lazyImage";
import { OptimizedForm } from "@/components/optimizedForm";
import { UserItem } from "@/components/userList";

export default function ReactOptimizationDemo() {
  const [count, setCount] = useState(0);
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [users] = useState<UserItem[]>([
    { id: 1, name: "張三", email: "zhang@example.com" },
    { id: 2, name: "李四", email: "li@example.com" },
    { id: 3, name: "王五", email: "wang@example.com" },
    { id: 4, name: "趙六", email: "zhao@example.com" },
  ]);

  // 生成大量數據用於虛擬化示範
  const largeDataSet = useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => `數據項目 ${i + 1}`);
  }, []);

  const handleAddNumber = useCallback(() => {
    setNumbers((prev) => [...prev, Math.floor(Math.random() * 100)]);
  }, []);

  const handleUpdateChild = useCallback((name: string) => {
    console.log(`更新子組件: ${name}`);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          React 組件優化示範
        </h1>
        <p className="text-gray-600">展示各種 React 效能優化技巧</p>
      </div>

      {/* 計數器控制 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCount((prev) => prev + 1)}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          重新渲染 (計數: {count})
        </button>
        <button
          onClick={handleAddNumber}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          添加數字
        </button>
      </div>

      {/* React.memo 示範 */}
      <div>
        <h2 className="text-xl font-bold mb-3">1. React.memo 防止重新渲染</h2>
        <ExpensiveChild name="小明" age={25} onUpdate={handleUpdateChild} />
      </div>

      {/* useMemo 示範 */}
      <div>
        <h2 className="text-xl font-bold mb-3">2. useMemo 記憶化計算</h2>
        <ExpensiveCalculation numbers={numbers} />
      </div>

      {/* useCallback 示範 */}
      <div>
        <h2 className="text-xl font-bold mb-3">3. useCallback 記憶化函數</h2>
        <UserList users={users} />
      </div>

      {/* 虛擬化示範 */}
      <div>
        <h2 className="text-xl font-bold mb-3">4. 虛擬化處理大量數據</h2>
        {/* 一千筆的資料 */}
        <VirtualizedList items={largeDataSet} />
      </div>

      {/* 延遲載入示範 */}
      <div>
        <h2 className="text-xl font-bold mb-3">5. 圖片延遲載入</h2>
        <div className="flex space-x-4">
          <LazyImage src="https://picsum.photos/200/200?random=1" alt="圖片1" />
          <LazyImage src="https://picsum.photos/200/200?random=2" alt="圖片2" />
          <LazyImage src="https://picsum.photos/200/200?random=3" alt="圖片3" />
        </div>
      </div>

      {/* 表單優化示範 */}
      <div>
        <h2 className="text-xl font-bold mb-3">6. 狀態優化表單</h2>
        <OptimizedForm />
      </div>

      {/* 優化技巧總結 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-3">🎯 優化技巧總結</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-green-600">✅ 好的做法</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>使用 React.memo 防止不必要渲染</li>
              <li>useMemo 快取昂貴計算</li>
              <li>useCallback 記憶化函數</li>
              <li>虛擬化處理大量數據</li>
              <li>延遲載入圖片和組件</li>
              <li>適當的狀態結構設計</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-red-600">❌ 避免的做法</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>在 render 中創建新物件</li>
              <li>過度使用 useState</li>
              <li>不必要的 useEffect</li>
              <li>內聯函數和物件</li>
              <li>深層狀態嵌套</li>
              <li>忽略 key 屬性</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
