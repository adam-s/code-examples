import React, { useMemo } from 'react';

import { Group } from '@visx/group';
import { AxisLeft, AxisScale } from '@visx/axis';
import { ScaleInput, scaleLinear } from '@visx/scale';
import { extent } from 'd3-array';

import { Ticker } from '../types';
import { LinePath } from '@visx/shape';
import { GridColumns, GridRows } from '@visx/grid';

export type Props = {
  width: number;
  height: number;
  xScale: ScaleInput<AxisScale>;
  tickers: Array<Ticker>;
  margin: { top: number; right: number; bottom: number; left: number };
};

const date = (d: Ticker) => d.date.valueOf();
const close = (d: Ticker) => Number(d.close);

const StocksChartTicker: React.FC<Props> = ({
  width,
  height,
  xScale,
  tickers,
  margin,
}) => {
  const yScale: ScaleInput<AxisScale> = useMemo(
    () =>
      scaleLinear({
        domain: extent(tickers, close) as [number, number],
      }),
    [tickers]
  );

  xScale.range([0, width]);
  yScale.range([height, 0]);

  return (
    <Group>
      <GridRows
        scale={yScale}
        width={width}
        height={height}
        stroke="#e0e0e0"
        numTicks={5}
      />
      <GridColumns
        scale={xScale}
        width={width}
        height={height}
        stroke="#e0e0e0"
      />
      <AxisLeft scale={yScale} numTicks={5} />
      <LinePath
        stroke="#006a71"
        strokeWidth={1}
        data={tickers}
        x={(d) => xScale(date(d))}
        y={(d) => yScale(close(d))}
      />
      <line x1={width} x2={width} y1={0} y2={height} stroke="#e0e0e0" />
    </Group>
  );
};

export default StocksChartTicker;
