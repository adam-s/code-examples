import React, { useMemo } from 'react';
import { pairs } from 'd3-array';

import StocksChartTicker from './StocksChartTicker';
import StocksChartDelta from './StocksChartDelta';
import { roundPlaces } from '../utils/roundPlaces';
import {
  YahooTickerDeltaEntry,
  YahooTicker,
  Ticker,
  Delta,
  DateDomain,
} from '../types';
import { tradingHours } from '../date';

import * as fc from '../scale/discontinuous';
import { scaleTime } from 'd3-scale';
import { AxisBottom } from '@visx/axis';
import { Group } from '@visx/group';

export type Props = {
  tickers: Array<YahooTicker>;
  deltas: Array<YahooTickerDeltaEntry>;
};

const background = 'rgba(255, 255, 255)';

const processRawTickers = (tickers: Array<YahooTicker>): Array<Ticker> =>
  tickers
    .map(
      (d): Ticker => ({
        date: new Date(d.time),
        close: roundPlaces(Number(d.close)),
      })
    )
    .filter((d) => d.close !== 0)
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());

const processRawDeltas = (deltas: Array<YahooTickerDeltaEntry>): Array<Delta> =>
  deltas
    .map(
      (d): Delta => ({
        date: new Date(d.date),
        lag1: d.lag1 ?? 0,
        lag5: d.lag5 ?? 0,
        lag15: d.lag15 ?? 0,
        lag30: d.lag30 ?? 0,
      })
    )
    .filter(
      (d) => d.lag1 !== 0 && d.lag5 !== 0 && d.lag15 !== 0 && d.lag30 !== 0
    )
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());

const getDate = (d: { date: Date }) => d.date;

const width = 1000;
const height = 260;

const StocksChart: React.FC<Props> = ({
  tickers: tickersRaw,
  deltas: deltasRaw,
}) => {
  const tickers: Array<Ticker> = useMemo(() => processRawTickers(tickersRaw), [
    tickersRaw,
  ]);
  const deltas: Array<Delta> = useMemo(() => processRawDeltas(deltasRaw), [
    deltasRaw,
  ]);

  const dates = useMemo(() => {
    const tickersDates = tickers.map(getDate);
    const deltasDates = deltas.map(getDate);
    Array.prototype.push.apply(tickersDates, deltasDates);
    return [...new Set(tickersDates)].sort((a, b) => a.valueOf() - b.valueOf());
  }, [tickers, deltas]);

  const dateDomain: DateDomain = useMemo(
    () => [dates[0], dates[dates.length - 1]],
    [dates]
  );

  const tradingHoursArray = useMemo(() => tradingHours(dates, dateDomain), [
    dates,
    dateDomain,
  ]);

  const discontinuities = useMemo(() => {
    return pairs(tradingHoursArray).map((d) => [d[0][1], d[1][0]]);
  }, [tradingHoursArray]);

  const xScale = useMemo(
    () =>
      fc
        .scaleDiscontinuous(scaleTime())
        .discontinuityProvider(fc.discontinuityRange(...discontinuities))
        .domain(dateDomain)
        .range([0, width]),
    [discontinuities, dateDomain]
  );

  const buffer = { top: 20, right: 30, bottom: 30, left: 40 };

  xScale.range([0, width - buffer.right - buffer.left]);
  return (
    <svg width={width} height={height}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={background}
        rx={5}
      />
      <Group top={buffer.top} left={buffer.left}>
        <StocksChartTicker
          xScale={xScale}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          tickers={tickers}
          width={width - buffer.left - buffer.right}
          height={height / 2 - buffer.bottom}
        />
        <StocksChartDelta
          xScale={xScale}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          deltas={deltas}
          width={width - buffer.left - buffer.right}
          height={height / 2 - buffer.top - buffer.bottom}
        />
        <AxisBottom top={height - buffer.top - buffer.bottom} scale={xScale} />
      </Group>
    </svg>
  );
};

export default React.memo(StocksChart);
