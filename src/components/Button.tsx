import React from "react";

interface ButtonProps {
    children?: React.ReactNode;
    state?: "default" | "disabled";
    color?: "default" | "red" | "blue" | "grey";
    onClick?: () => void;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children = "hey",
    state = "default",
    color = "primary",
    onClick,
    className,
}) => {
    const getClassNames = () => {
        let classNames = "button";
        classNames += ` ${color}`;
        if (state === "disabled") {
            classNames += " disabled";
        }
        if (className) {
            classNames += ` ${className}`;
        }
        return classNames;
    };

    return (
        <button className={getClassNames()} onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;

