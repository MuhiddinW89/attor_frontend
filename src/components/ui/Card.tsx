import type { ReactNode } from "react";
import "./Card.css";

type CardProps = {
    children: ReactNode;
    className?: string;
};

export default function Card({
    children,
    className = "",
}: CardProps) {
    return (
        <div className={`ui-card ${className}`}>
            {children}
        </div>
    );
}