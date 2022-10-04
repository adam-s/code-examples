export const QUOTES_QUERY = /* sql */ `
    SELECT time_bucket($1, time) as date,
        symbol,
        last(open, time) as open,
        last(close, time) as close,
        last(high, time) as high,
        last(low, time) as low,
        last(volume, time) as volume
    FROM yahoo_ticker
    WHERE symbol = ANY($2)
        AND time >= $3
    GROUP BY symbol, date
    ORDER BY symbol ASC, date ASC;
`;
