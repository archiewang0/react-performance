import React, {
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
  useEffect,
} from "react";

interface ExpensiveCalculationProps {
  numbers: number[];
}
// ========================
// 2. useMemo - 記憶化計算結果
// ========================
export const ExpensiveCalculation = ({
  numbers,
}: ExpensiveCalculationProps) => {
  // ❌ 每次渲染都會重新計算
  // const sum = numbers.reduce((acc, num) => acc + num, 0);

  // ✅ 只在 numbers 改變時才重新計算
  const sum = useMemo(() => {
    console.log("🔄 執行昂貴的計算...");
    return numbers.reduce((acc, num) => {
      // 模擬複雜計算
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      return acc + num;
    }, 0);
  }, [numbers]);

  const average = useMemo(() => {
    return numbers.length > 0 ? sum / numbers.length : 0;
  }, [sum, numbers.length]);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-4">
      <h3 className="font-bold">計算結果</h3>
      <p>總和: {sum}</p>
      <p>平均: {average.toFixed(2)}</p>
    </div>
  );
};
