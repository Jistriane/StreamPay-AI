"use client";
import React from "react";
import Card from "./Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "glass" | "gradient";
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "glass"
}: StatsCardProps) {
  return (
    <Card variant={variant} hover className="stats-card">
      <div className="stats-content">
        {icon && <div className="stats-icon">{icon}</div>}
        <div className="stats-main">
          <h3 className="stats-title">{title}</h3>
          <div className="stats-value">{value}</div>
          {subtitle && <p className="stats-subtitle">{subtitle}</p>}
          {trend && (
            <div className={`stats-trend ${trend.isPositive ? "trend-up" : "trend-down"}`}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

