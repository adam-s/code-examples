export const DELTA_QUERY = /* sql */ `
WITH spy AS (
    SELECT bucket,
        symbol,
        close,
        LEAD(close, 1) OVER(ORDER BY bucket DESC) AS previous,
        close - LEAD(close, 1) OVER(ORDER BY bucket DESC) AS change,
        per_change_fn(close, LEAD(close, 1) OVER(ORDER BY bucket DESC)) AS per_change
    FROM (
        SELECT time_bucket('200 minute', time) as  bucket,
            symbol,
            last(close, time) AS close
        FROM yahoo_ticker
        WHERE symbol = 'SPY'
        GROUP BY symbol, bucket
        ORDER BY bucket DESC
    ) AS spy_inner
)
SELECT symbols.symbol,
    deltas.bucket,
    deltas.delta_change AS "deltaChange",
    SUM(deltas.delta_change) OVER(PARTITION BY symbols.symbol ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS "cumulativeChange"
FROM (
    SELECT unnest(string_to_array($1, ',')) AS symbol
) symbols
LEFT JOIN LATERAL (
    WITH delta AS (
        SELECT bucket,
            symbol,
            close,
            LEAD(close, 1) OVER(ORDER BY bucket DESC) AS previous,
            close - LEAD(close, 1) OVER(ORDER BY bucket DESC) AS change,
            per_change_fn(close, LEAD(close, 1) OVER(ORDER BY bucket DESC)) AS per_change
        FROM (
            SELECT time_bucket('200 minute', time) as  bucket,
                symbol,
                last(close, time) AS close
            FROM yahoo_ticker
            WHERE symbol = symbols.symbol AND close IS NOT NULL
            GROUP BY symbol, bucket
            ORDER BY bucket DESC
        ) AS spy_inner
    )
    SELECT delta.bucket,
        delta.per_change,
        spy.per_change AS spy_per_change,
        ROUND(delta.per_change::NUMERIC - spy.per_change::NUMERIC, 3) AS delta_change
    FROM delta
    JOIN spy ON spy.bucket = delta.bucket
) deltas ON TRUE
WHERE deltas.delta_change IS NOT NULL;
`;
