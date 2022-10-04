import React, { useMemo } from 'react';

import { Group } from '@visx/group';
import { AxisLeft, AxisScale } from '@visx/axis';
import { ScaleInput, scaleLinear } from '@visx/scale';
import { GridColumns, GridRows } from '@visx/grid';
import { curveBasis } from '@visx/curve';
import { LinePath } from '@visx/shape';

import { Delta } from '../types';
import colors from '../utils/colors';

export type Props = {
  width: number;
  height: number;
  xScale: ScaleInput<AxisScale>;
  deltas: Array<Delta>;
  margin: { top: number; right: number; bottom: number; left: number };
};

const date = (d: Delta) => d.date.valueOf();
const lag1 = (d: Delta) => Number(d.lag1);
const lag5 = (d: Delta) => Number(d.lag5);
const lag15 = (d: Delta) => Number(d.lag15);
const lag30 = (d: Delta) => Number(d.lag30);
const flat = (d: Delta) => [lag1(d), lag5(d), lag15(d), lag30(d)].map(Math.abs);

const StocksChartDelta: React.FC<Props> = ({
  width,
  height,
  xScale,
  deltas,
}) => {
  const deltasValues = useMemo(() => deltas.flatMap(flat), [deltas]);
  const absMax = useMemo(() => Math.max(...deltasValues), [deltasValues]);

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [-absMax, absMax],
        nice: true,
      }),
    [absMax]
  );

  xScale.range([0, width]);
  yScale.range([height, 0]);

  return (
    <Group top={130}>
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
      <line x1={width} x2={width} y1={0} y2={height} stroke="#e0e0e0" />

      <AxisLeft scale={yScale} numTicks={5} />

      <LinePath
        data={deltas}
        curve={curveBasis}
        x={(d) => xScale(date(d))}
        y={(d) => yScale(lag30(d))}
        strokeWidth={1.5}
        stroke={colors.orange}
      />
      <LinePath
        data={deltas}
        curve={curveBasis}
        x={(d) => xScale(date(d))}
        y={(d) => yScale(lag5(d))}
        strokeWidth={2}
        stroke={colors.green}
      />
      <LinePath
        data={deltas}
        curve={curveBasis}
        x={(d) => xScale(date(d))}
        y={(d) => yScale(lag15(d))}
        strokeWidth={1}
        stroke={colors.purple}
      />
      <LinePath
        data={deltas}
        curve={curveBasis}
        x={(d) => xScale(date(d))}
        y={(d) => yScale(lag1(d))}
        strokeWidth={2}
        stroke={colors.blue}
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
    </Group>
  );
};

export default StocksChartDelta;
