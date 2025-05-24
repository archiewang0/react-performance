import React, { useState, useCallback, memo, ChangeEvent } from "react";

// ========================
// 6. 狀態優化 - 避免不必要的狀態更新
// ========================
export const OptimizedForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  // 使用 useCallback 防止子組件重新渲染
  const handleInputChange = useCallback(
    (field: keyof typeof formData) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // 清除該欄位的錯誤
        if (errors[field]) {
          setErrors((prev) => ({ ...prev, [field]: "" }));
        }
      },
    [errors]
  );

  const validateForm = useCallback(() => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!formData.name.trim()) newErrors.name = "姓名必填";
    if (!formData.email.trim()) newErrors.email = "信箱必填";
    if (!formData.message.trim()) newErrors.message = "訊息必填";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (validateForm()) {
        console.log("表單提交:", formData);
      }
    },
    [formData, validateForm]
  );

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
      <h3 className="font-bold mb-3">優化表單</h3>
      <div className="space-y-3">
        <FormField
          label="姓名"
          value={formData.name}
          onChange={handleInputChange("name")}
          error={errors.name}
        />
        <FormField
          label="信箱"
          type="email"
          value={formData.email}
          onChange={handleInputChange("email")}
          error={errors.email}
        />
        <FormField
          label="訊息"
          type="textarea"
          value={formData.message}
          onChange={handleInputChange("message")}
          error={errors.message}
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          提交
        </button>
      </div>
    </div>
  );
};

interface FormFieldProps {
  label: string;
  type?: "text" | "textarea" | "email";
  value: string | number | readonly string[] | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error: string | undefined;
}

const FormField = memo(
  ({ label, type = "text", value, onChange, error }: FormFieldProps) => {
    console.log(`FormField 渲染: ${label}`);

    const inputProps = {
      value,
      onChange,
      className: `w-full p-2 border border-gray-300 rounded ${
        error ? "border-red-500" : ""
      }`,
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {type === "textarea" ? (
          <textarea {...inputProps} rows={3} />
        ) : (
          <input type={type} {...inputProps} />
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);
