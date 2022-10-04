import React from 'react';
import { scaleLinear, scaleTime } from '@visx/scale';
import { Group } from '@visx/group';
import { GridRows, GridColumns } from '@visx/grid';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { Threshold } from '@visx/threshold';
import { curveBasis } from '@visx/curve';
import { LinePath } from '@visx/shape';
import * as models from '../../models';
import { extent, pairs } from 'd3-array';
import * as fc from '../scale/discontinuous';
import { getHolidaysSetInRange } from '../date';

type YahooTickerDeltaEntry = models.YahooTickerDeltaEntry;

export const background = '#f3f3f3';

// accessors
const date = (d: YahooTickerDeltaEntry) => new Date(d.epoch).valueOf();
const ny = (d: YahooTickerDeltaEntry) => Number(d.lag15Diff);

const defaultMargin = { top: 40, right: 30, bottom: 50, left: 40 };

export type Props = {
  width: number;
  height: number;
  deltas: Array<YahooTickerDeltaEntry>;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const StocksDeltaChart = ({
  width,
  height,
  deltas,
  margin = defaultMargin,
}: Props) => {
  if (width < 10) return null;

  //bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // scales

  const dateDomain = extent(
    deltas,
    (d: YahooTickerDeltaEntry) => new Date(d.epoch)
  ) as [Date, Date];
  const holidays = getHolidaysSetInRange(...dateDomain);

  const tradingHours = (dates: Array<Date>) => {
    const getDateKey = (date: Date) =>
      date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear();
    const holidayDateKeys = holidays.map((value) =>
      getDateKey(new Date(...value))
    );
    const tradingHours: Record<string, Array<Date>> = dates.reduce(
      (acc: Record<string, Array<Date>>, curr) => {
        const dateKey = getDateKey(curr);

        if (dateKey in holidayDateKeys) return acc;

        if (!acc.hasOwnProperty(dateKey)) {
          acc[dateKey] = [curr, curr];
        } else {
          acc[dateKey][1] = curr;
        }
        return acc;
      },
      {}
    );
    return Object.keys(tradingHours).map((d) => tradingHours[d]);
  };

  const tradingHoursArray = tradingHours(deltas.map((d) => new Date(d.epoch)));
  const discontinuities = pairs(tradingHoursArray).map((d) => [
    d[0][1],
    d[1][0],
  ]);

  const xScale = fc
    .scaleDiscontinuous(scaleTime())
    .discontinuityProvider(fc.discontinuityRange(...discontinuities))
    .domain(
      (extent(deltas, (d: YahooTickerDeltaEntry) =>
        date(d)
      ) as unknown) as number[]
    )
    .range([0, width]);

  const maxValue = Math.max(...deltas.map((d) => ny(d)));
  const minValue = Math.min(...deltas.map((d) => ny(d)));
  const absMax = Math.max(Math.abs(maxValue), Math.abs(minValue));
  const yScale = scaleLinear<number>({
    domain: [-absMax, absMax],
    nice: true,
  });

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  return (
    <div>
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={background}
          rx={14}
        />
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={yScale}
            width={xMax}
            height={yMax}
            stroke="#e0e0e0"
          />
          <GridColumns
            scale={xScale}
            width={xMax}
            height={yMax}
            stroke="#e0e0e0"
          />
          <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
          <AxisBottom top={yMax} scale={xScale} />
          <AxisLeft scale={yScale} />
          <text x="-70" y="15" transform="rotate(-90)" fontSize={10}>
            Temperature (°F)
          </text>
          <Threshold<YahooTickerDeltaEntry>
            id={`${Math.random()}`}
            data={deltas}
            x={(d) => xScale(date(d)) ?? 0}
            y0={(d) => yScale(ny(d)) ?? 0}
            y1={yScale(0)}
            clipAboveTo={0}
            clipBelowTo={yMax}
            curve={curveBasis}
            belowAreaProps={{
              fill: 'violet',
              fillOpacity: 0.4,
            }}
            aboveAreaProps={{
              fill: 'green',
              fillOpacity: 0.4,
            }}
          />
          <LinePath
            data={deltas}
            curve={curveBasis}
            x={(d) => xScale(date(d)) ?? 0}
            y={yScale(0)}
            stroke="#222"
            strokeWidth={1.5}
            strokeOpacity={0.8}
            strokeDasharray="1,2"
          />
          <LinePath
            data={deltas}
            curve={curveBasis}
            x={(d) => xScale(date(d)) ?? 0}
            y={(d) => yScale(ny(d)) ?? 0}
            stroke="#222"
            strokeWidth={1.5}
          />
        </Group>
      </svg>
    </div>
  );
};

export default StocksDeltaChart;
