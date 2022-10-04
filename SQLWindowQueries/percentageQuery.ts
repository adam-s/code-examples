export const PERCENTAGE_QUERY = /* sql */ `
    WITH lags AS (
    SELECT timer,
        col [1] col1,
        col [2] col2,
        LAG(col [1] , 1) OVER (ORDER BY timer) AS lag1_col1,
        LAG(col [2] , 1) OVER (ORDER BY timer) AS lag1_col2,
        LAG(col [1] , 15) OVER (ORDER BY timer) AS lag15_col1,
        LAG(col [2] , 15) OVER (ORDER BY timer) AS lag15_col2,
        LAG(col [1] , 60) OVER (ORDER BY timer) AS lag60_col1,
        LAG(col [2] , 60) OVER (ORDER BY timer) AS lag60_col2
    FROM (
        WITH closes AS (
            SELECT time_bucket(
                    $3,
                    time
                ) AS timer,
                symbol,
                AVG(close) AS last_close
            FROM yahoo_ticker
            WHERE symbol IN ($1, $2)
                AND now() - date(time) < ($4 || ' day')::INTERVAL 
            GROUP BY timer, symbol
            ORDER BY timer, symbol
        )
        SELECT timer, array_agg(last_close) AS col
        FROM closes
        GROUP BY timer
    ) AS subselect
    )
    SELECT timer AS epoch,
    ROUND(col1::numeric, 3) AS col1,
    per_change_fn(col1, lag1_col1) AS col1lag1,
    per_change_fn(col1, lag15_col1) AS col1lag15,
    per_change_fn(col1, lag60_col1) AS col1lag60,
    ROUND(col2::numeric, 3) AS col2,
    per_change_fn(col2, lag1_col2) AS col2lag1,
    per_change_fn(col2, lag15_col2) AS col2lag15,
    per_change_fn(col2, lag60_col2) AS col2Lag60
    FROM lags
    WHERE col1 IS NOT NULL
        AND lag1_col1 IS NOT NULL
        AND lag15_col1 IS NOT NULL
        AND lag60_col1 IS NOT NULL
        AND col2 IS NOT NULL
        AND lag1_col2 IS NOT NULL
        AND lag15_col2 IS NOT NULL
        AND lag60_col2 IS NOT NULL
    ORDER BY timer ASC;
`;
