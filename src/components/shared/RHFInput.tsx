import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

type RHFInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: Record<string, any>;
};

export default function RHFInput({
  name,
  label,
  placeholder,
  type = "text",
  defaultValue,
  rules,
}: RHFInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string;

  const [showPassword, setShowPassword] = useState(false);

  // Decide the input type
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="flex flex-1 flex-col gap-2 w-full relative">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative w-full">
        <Input
          id={name}
          type={inputType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`border ${
            error ? "border-red-500" : "border-gray-400"
          } bg-white w-full pr-10`}
          {...register(name, rules)}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
