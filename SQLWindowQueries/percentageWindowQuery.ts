export const PERCENTAGE_WINDOW_QUERY = /* sql */ `
SELECT bucket AS "date",
    ROUND(close::NUMERIC, 3) AS close,
    per_change_fn(close + diff, close) as lag1,
    per_change_fn(close +  SUM(diff) OVER (ORDER BY BUCKET ROWS BETWEEN 5 PRECEDING AND CURRENT ROW), close) AS lag5,
    per_change_fn(close +  SUM(diff) OVER (ORDER BY BUCKET ROWS BETWEEN 15 PRECEDING AND CURRENT ROW), close) AS lag15,
    per_change_fn(close +  SUM(diff) OVER (ORDER BY BUCKET ROWS BETWEEN 30 PRECEDING AND CURRENT ROW), close) AS lag30
FROM (
    SELECT bucket,
        close,
        close - LAG(close, 1) OVER () AS diff
    FROM (
        SELECT time_bucket(
        '30 minute',
        time
        ) AS bucket,
        AVG(close) AS close
        FROM yahoo_ticker
        WHERE yahoo_ticker.symbol = $1
            AND now() - date(time) < ($2 || ' day')::INTERVAL
        GROUP BY bucket
    ) AS bucket_close_table
    ORDER BY bucket ASC
) AS bucket_diff_table
ORDER BY bucket ASC
OFFSET 1 ROW;
`;
