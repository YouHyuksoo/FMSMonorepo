"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@fms/ui/card";
import { Sensor } from "@fms/types";
import { useEffect, useRef } from "react";
import { Gauge } from "@fms/ui/gauge";

interface SensorGaugeProps {
  sensor: Sensor;
  min?: number;
  max?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export function SensorGauge({
  sensor,
  min = 0,
  max = 100,
  warningThreshold,
  criticalThreshold,
}: SensorGaugeProps) {
  const getGaugeColor = (value: number) => {
    if (criticalThreshold && value >= criticalThreshold) {
      return "text-red-500";
    }
    if (warningThreshold && value >= warningThreshold) {
      return "text-yellow-500";
    }
    return "text-green-500";
  };

  const getStatusText = (value: number) => {
    if (criticalThreshold && value >= criticalThreshold) {
      return "위험";
    }
    if (warningThreshold && value >= warningThreshold) {
      return "주의";
    }
    return "정상";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{sensor.name}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">📊</div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-2">
          <Gauge
            value={sensor.lastValue}
            min={min}
            max={max}
            size="lg"
            className={getGaugeColor(sensor.lastValue)}
          />
          <div className="text-center">
            <div className="text-2xl font-bold">
              {sensor.lastValue} {sensor.unit}
            </div>
            <p className="text-xs text-muted-foreground">
              {getStatusText(sensor.lastValue)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
