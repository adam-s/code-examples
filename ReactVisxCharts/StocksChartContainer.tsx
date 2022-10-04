import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';

import * as models from '../../models';

import StocksChart from './StocksChart';
import { YahooSymbolsOrdered } from '../types';

type Props = {
  data: YahooSymbolsOrdered;
};

type TData = {
  yahooTickersDeltas: models.YahooTickerDelta;
  yahooTickers: Array<models.YahooTicker>;
};

const StocksChartContainer: React.FC<Props> = ({ data: { symbol } }) => {
  const { data } = useQuery<TData>(GET_YAHOO_TICKER, {
    variables: {
      symbol,
      symbols: [symbol],
    },
  });
  console.log(data);
  const deltas = data?.yahooTickersDeltas?.data;
  const tickers = data?.yahooTickers;

  if (!deltas || !tickers) return null;

  return (
    <div>
      <h1>{symbol}</h1>
      <StocksChart deltas={deltas} tickers={tickers} />
    </div>
  );
};

export default StocksChartContainer;

const GET_YAHOO_TICKER = gql`
  query getYahooTickers($symbols: [String!]!, $symbol: String!) {
    yahooTickersDeltas(symbol: $symbol) {
      data {
        date
        lag1
        lag5
        lag15
        lag30
      }
    }
    yahooTickers(symbol: $symbols) {
      open
      high
      low
      close
      volume
      time
      symbol
    }
  }
`;
