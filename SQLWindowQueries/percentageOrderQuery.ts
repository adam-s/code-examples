export const PERCENTAGE_ORDER_SYMBOLS_QUERY = /* sql */ `
SELECT table2.symbol AS symbol,
    table2.lag15 AS "perChange"
FROM (
    SELECT unnest(string_to_array($1, ',')) AS symbol
) table1 LEFT JOIN LATERAL (
    SELECT bucket AS date,
        symbol,
        lag15
    FROM (
        SELECT bucket,
            symbol,
            ROUND(close::NUMERIC, 3) AS close,
            per_change_fn(close +  SUM(diff) OVER (ORDER BY bucket DESC ROWS BETWEEN CURRENT ROW AND ($3 + 2) FOLLOWING), close) AS lag15
        FROM (
            SELECT bucket,
                symbol,
                close,
                close - LEAD(close, 1) OVER () AS diff
            FROM (
                SELECT time_bucket(
                $2,
                time
                ) AS bucket,
                AVG(close) AS close
                FROM yahoo_ticker
                WHERE yahoo_ticker.symbol = table1.symbol
                    AND now() - ($4 || ' day')::INTERVAL >= date(time)
                GROUP BY bucket
                ORDER BY bucket DESC
                LIMIT ($3 + 3)
            ) AS bucket_close_table
            ORDER BY bucket DESC
        ) AS bucket_diff_table
    ) AS lag_calc_table
    ORDER BY bucket DESC
    LIMIT 1
) table2 ON true
WHERE "table2"."symbol" != 'null'
ORDER BY "table2"."lag15" DESC
`;
