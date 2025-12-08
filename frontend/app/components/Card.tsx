"use client";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "gradient" | "bordered";
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export default function Card({ 
  children, 
  className = "", 
  variant = "default",
  hover = false,
  padding = "md"
}: CardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  const variantClasses = {
    default: "card-default",
    glass: "card-glass",
    gradient: "card-gradient",
    bordered: "card-bordered"
  };

  return (
    <div 
      className={`card ${variantClasses[variant]} ${paddingClasses[padding]} ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

