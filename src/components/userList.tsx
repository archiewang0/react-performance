import React, {
  useState,
  useMemo,
  useCallback,
  memo,
  ChangeEvent,
} from "react";

interface UserListProps {
  users: UserItem[];
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
}

interface UserItemProps {
  user: UserItem;
  onClick: (id: number) => void;
}

// ========================
// 3. useCallback - 記憶化函數
// ========================
export const UserList = ({ users }: UserListProps) => {
  const [filter, setFilter] = useState("");
  const [renderCount, setRenderCount] = useState(0);

  // ❌ 每次渲染都會創建新的函數
  // const handleUserClick = (userId) => {
  //   console.log('點擊用戶:', userId);
  // };

  // ✅ 使用 useCallback 記憶化函數
  const handleUserClick = useCallback((userId: number) => {
    console.log("點擊用戶:", userId);
    setRenderCount((prev) => prev + 1);
  }, []); // 空依賴陣列表示函數永遠不變

  const handleFilterChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
    },
    []
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded mb-4">
      <h3 className="font-bold">用戶列表 (點擊次數: {renderCount})</h3>
      <input
        type="text"
        placeholder="搜尋用戶..."
        value={filter}
        onChange={handleFilterChange}
        className="w-full p-2 border border-gray-300 rounded mb-3"
      />
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <UserItem key={user.id} user={user} onClick={handleUserClick} />
        ))}
      </div>
    </div>
  );
};

const UserItem = memo(({ user, onClick }: UserItemProps) => {
  console.log(`UserItem 渲染: ${user.name}`);

  return (
    <div
      className="p-2 bg-white border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
      onClick={() => onClick(user.id)}
    >
      <span className="font-medium">{user.name}</span>
      <span className="text-gray-500 ml-2">({user.email})</span>
    </div>
  );
});
