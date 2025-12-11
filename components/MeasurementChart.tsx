import React, { useState, useMemo } from 'react';
import type { DataCollection, Equipment } from '../types';

interface MeasurementChartProps {
  equipment: Equipment;
  collectionsForEquipment: DataCollection[];
}

const MeasurementChart: React.FC<MeasurementChartProps> = ({ equipment, collectionsForEquipment }) => {
  const availableMetrics = useMemo(() => [
    { key: 'temperature', name: 'Temperatura', unit: '°C' },
    { key: 'vibration', name: 'Vibração', unit: '' },
    { key: 'pressure', name: 'Pressão', unit: 'bar' },
    ...equipment.customFields.map(f => ({ key: f.name, name: f.name, unit: f.unit })),
  ], [equipment]);

  const [selectedMetric, setSelectedMetric] = useState(availableMetrics[0].key);

  const dataPoints = useMemo(() => {
    if (collectionsForEquipment.length < 2) return [];

    const points = collectionsForEquipment
      .map(c => {
        let value: number | undefined;
        if (selectedMetric === 'temperature') value = c.temperature;
        else if (selectedMetric === 'vibration') value = c.vibration;
        else if (selectedMetric === 'pressure') value = c.pressure;
        else value = c.customFieldValues?.[selectedMetric];
        
        return value !== undefined ? { date: new Date(c.date), value } : null;
      })
      .filter((p): p is { date: Date; value: number } => p !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return points;
  }, [selectedMetric, collectionsForEquipment]);

  const chartDimensions = { width: 500, height: 250, margin: { top: 20, right: 20, bottom: 50, left: 50 } };
  const innerWidth = chartDimensions.width - chartDimensions.margin.left - chartDimensions.margin.right;
  const innerHeight = chartDimensions.height - chartDimensions.margin.top - chartDimensions.margin.bottom;

  const { yMin, yMax, xMin, xMax, yTicks, xTicks } = useMemo(() => {
    if (dataPoints.length === 0) return { yMin: 0, yMax: 0, xMin: 0, xMax: 0, yTicks: [], xTicks: [] };

    const values = dataPoints.map(p => p.value);
    const dates = dataPoints.map(p => p.date.getTime());

    const dataYMin = Math.min(...values);
    const dataYMax = Math.max(...values);
    const yRange = dataYMax - dataYMin;
    const yMin = yRange === 0 ? dataYMin - 1 : dataYMin - yRange * 0.1;
    const yMax = yRange === 0 ? dataYMax + 1 : dataYMax + yRange * 0.1;

    const xMin = Math.min(...dates);
    const xMax = Math.max(...dates);
    
    // Generate Y Ticks
    const numYTicks = 5;
    const yTickInterval = (yMax - yMin) / (numYTicks - 1);
    const yTicks = Array.from({ length: numYTicks }, (_, i) => yMin + i * yTickInterval);
    
    // Generate X Ticks
    const numXTicks = Math.min(4, dataPoints.length);
    const xTickInterval = (xMax - xMin) / (numXTicks -1);
    const xTicks = numXTicks > 1 ? Array.from({ length: numXTicks }, (_, i) => new Date(xMin + i * xTickInterval)) : [new Date(xMin)];


    return { yMin, yMax, xMin, xMax, yTicks, xTicks };
  }, [dataPoints]);
  
  const toSvgX = (date: Date) => {
    const time = date.getTime();
    if (xMax === xMin) return chartDimensions.margin.left;
    return chartDimensions.margin.left + ((time - xMin) / (xMax - xMin)) * innerWidth;
  };

  const toSvgY = (value: number) => {
    if (yMax === yMin) return chartDimensions.margin.top + innerHeight / 2;
    return chartDimensions.margin.top + innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;
  };

  const linePath = dataPoints.map(p => `${toSvgX(p.date)},${toSvgY(p.value)}`).join(' ');

  const selectedMetricInfo = availableMetrics.find(m => m.key === selectedMetric);

  return (
    <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Histórico de Medições</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {availableMetrics.map(metric => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedMetric === metric.key
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
            }`}
          >
            {metric.name}
          </button>
        ))}
      </div>

      {dataPoints.length < 2 ? (
         <div className="flex items-center justify-center h-48 bg-slate-200 dark:bg-slate-600 rounded-md">
            <p className="text-slate-500 dark:text-slate-400">Dados insuficientes para gerar o gráfico (mínimo de 2 coletas).</p>
         </div>
      ) : (
        <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`} className="font-sans text-xs">
                {/* Y-axis grid and labels */}
                {yTicks.map((tick, i) => (
                <g key={i} transform={`translate(0, ${toSvgY(tick)})`}>
                    <line x1={chartDimensions.margin.left} x2={chartDimensions.width - chartDimensions.margin.right} stroke="currentColor" className="stroke-slate-200 dark:stroke-slate-600" strokeWidth="0.5" />
                    <text x={chartDimensions.margin.left - 8} y="3" textAnchor="end" className="fill-current text-slate-500 dark:text-slate-400">
                    {tick.toFixed(1)}
                    </text>
                </g>
                ))}
                
                 {/* X-axis labels */}
                {xTicks.map((tick, i) => (
                     <text key={i} x={toSvgX(tick)} y={chartDimensions.height - chartDimensions.margin.bottom + 15} textAnchor="middle" className="fill-current text-slate-500 dark:text-slate-400">
                        {tick.toLocaleDateString([], { month: '2-digit', day: '2-digit' })}
                    </text>
                ))}

                {/* Axes lines */}
                <line x1={chartDimensions.margin.left} y1={chartDimensions.margin.top} x2={chartDimensions.margin.left} y2={chartDimensions.height - chartDimensions.margin.bottom} stroke="currentColor" className="stroke-slate-300 dark:stroke-slate-500" />
                <line x1={chartDimensions.margin.left} y1={chartDimensions.height - chartDimensions.margin.bottom} x2={chartDimensions.width - chartDimensions.margin.right} y2={chartDimensions.height - chartDimensions.margin.bottom} stroke="currentColor" className="stroke-slate-300 dark:stroke-slate-500" />
                
                {/* Data line */}
                <polyline fill="none" stroke="currentColor" className="stroke-blue-500" strokeWidth="2" points={linePath} />

                {/* Data points */}
                {dataPoints.map((p, i) => (
                    <circle key={i} cx={toSvgX(p.date)} cy={toSvgY(p.value)} r="3" className="fill-blue-500 stroke-white dark:stroke-slate-700/50" />
                ))}

                 {/* Axis titles */}
                <text transform={`translate(${chartDimensions.margin.left / 2 - 10}, ${chartDimensions.height / 2}) rotate(-90)`} textAnchor="middle" className="fill-current text-slate-600 dark:text-slate-300 text-sm">
                    {selectedMetricInfo?.name} {selectedMetricInfo?.unit && `(${selectedMetricInfo.unit})`}
                </text>
                 <text x={chartDimensions.width / 2} y={chartDimensions.height - 10} textAnchor="middle" className="fill-current text-slate-600 dark:text-slate-300 text-sm">
                    Data da Coleta
                </text>
            </svg>
        </div>
      )}
    </div>
  );
};

export default MeasurementChart;