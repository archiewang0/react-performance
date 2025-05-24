import React, { memo } from "react";

interface ExpensiveChildProps {
  name: string;
  age: number;
  onUpdate: (data: string) => void;
}

// ========================
// 1. React.memo - 防止不必要的重新渲染
// ========================
export const ExpensiveChild = memo(
  ({ name, age, onUpdate }: ExpensiveChildProps) => {
    console.log(`ExpensiveChild 渲染: ${name}`);

    return (
      <div className="p-4 border border-gray-300 rounded mb-4">
        <h3 className="font-bold">子組件: {name}</h3>
        <p>年齡: {age}</p>
        <button
          onClick={() => onUpdate(name)}
          className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
        >
          更新
        </button>
      </div>
    );
  }
);

ExpensiveChild.displayName = "ExpensiveChild";
