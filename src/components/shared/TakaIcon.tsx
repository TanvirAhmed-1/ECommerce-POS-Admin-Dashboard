import React from "react";
import { TbCurrencyTaka } from "react-icons/tb";

export interface TakaIconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
}

export const TakaIcon: React.FC<TakaIconProps> = ({
  size = 18,
  className = "",
  strokeWidth,
  ...props
}) => {
  return (
    <TbCurrencyTaka
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

export { TbCurrencyTaka as TakaSign };
export default TakaIcon;
