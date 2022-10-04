// import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * @URL http://www.accountingenhancements.com/filetree/PostgreSQL/psql_business_day.html
 *
 * Business Day and Tax Day Functions for Payroll for Postgresql
 *
 * Versions: (pgsql psql postgres 7.3, 7.4, 8.0, 8.1, 8.2, 8.3, 8.4)
 *
 * Calculate prior or next business day when a date lands on a weekend or a holiday.
 * Calculate due dates for semiweekly, monthly (15th of following month), and quarterly filers (last day of month following quarter end).
 *
 * weekday_prior(date)::date, weekday_next(date)::date, and weekday_closest(date)::date were created to support other functions on this page.
 * business_day_prior(date)::date was created to calculate first valid payroll date working backwards as necessary if the actual date lands on a weekend or federal holiday. Returns same date as argument unless it is a weekend or federal holiday.
 * business_day_next(date)::date was created to calculate the first valid payroll date working forwards as necessary if the actual date lands on a weekend or federal holiday. Returns same date as argument unless it is a weekend for federal holiday.
 *
 * The next 4 functions calculate payroll based withholding, FUTA, and SUI due dates. The filing rules allow pay days to land on weekends and holidays so these functions do as well. If company policy or unwritten standard practices state pay days land on non-holidays nor weekends then be sure to hand these routines the real pay day.
 * tax_day_semiweekly(date)::date calculates the next due date for semiweekly filers when handed a pay day.
 * tax_day_monthly(date)::date returns the valid business day on or following the 15th of the following month.
 * tax_day_end_of_next_month(date)::date returns the valid business day on or prior to the last day of the following month.
 * tax_day_quarterly(date)::date returns the valid business day on or prior to the end of the month following the end of the current quarter.
 */

// export class businessHolidayFunctions1616452574454
//   implements MigrationInterface {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(/* sql */ `
//         CREATE OR REPLACE FUNCTION weekday_prior(date) RETURNS date AS '
//         DECLARE
//             weekday integer;
//         BEGIN
//             weekday := extract(''dow'' from $1);
//             IF weekday = 0 THEN
//                 return $1  - 2::integer;
//             ELSIF weekday = 6 THEN
//                 return $1 - 1::integer;
//             ELSE
//                 return $1;
//             END IF;
//         END;
//         ' LANGUAGE plpgsql;

//         CREATE OR REPLACE FUNCTION weekday_next(date) RETURNS date AS '
//         DECLARE
//             weekday integer;
//         BEGIN
//             weekday := extract(''dow'' from $1);
//             IF weekday = 0 THEN
//                 return $1  + 1::integer;
//             ELSIF weekday = 6 THEN
//                 return $1 + 2::integer;
//             ELSE
//                 return $1;
//             END IF;
//         END;
//         ' LANGUAGE plpgsql;

//         CREATE OR REPLACE FUNCTION weekday_closest(date) RETURNS date AS '
//         DECLARE
//             weekday integer;
//         BEGIN
//             weekday := extract(''dow'' from $1);
//             IF weekday = 0 THEN
//                 return $1 + 1::integer;
//             ELSIF weekday = 6 THEN
//                 return $1 - 1::integer;
//             ELSE
//                 return $1;
//             END IF;
//         END;
//         ' LANGUAGE plpgsql;

//         CREATE OR REPLACE FUNCTION business_day_prior(date) RETURNS date AS '
//         DECLARE
//             incoming_date date;
//             work_date date;
//             end_date date;
//             holiday date;
//             year integer;
//             count integer;
//             month integer;
//         BEGIN
//             incoming_date := weekday_prior($1);
//             month := extract(''month'' from incoming_date);

//             -- New Years Day 1
//             IF month = 1 THEN
//                 year = extract(''year'' from incoming_date);
//                 holiday := weekday_closest((year::text||''-01-01'')::date);
//                 IF holiday = incoming_date THEN
//                     incoming_date = weekday_prior(incoming_date - 1::integer);
//                 END IF;
//             END IF;

//             -- New Years Day 2 (next year may be end of this year)
//             IF month = 12 THEN
//                 year = 1 + extract(''year'' from incoming_date);
//                 holiday := weekday_closest((year::text||''-01-01'')::date);
//                 IF holiday = incoming_date THEN
//                     incoming_date = weekday_prior(incoming_date - 1::integer);
//                 END IF;
//             END IF;

//             -- Martin Luther King Day
//             IF month = 1 THEN
//                     count := 0;
//                     year := extract(''year'' from incoming_date) - 1::integer;
//                     holiday := year||''-12-31'';
//                     WHILE count < 3 LOOP
//                             holiday := holiday + 1::integer;
//                             IF extract (''dow'' from holiday) = 1 THEN
//                                     count := count + 1;
//                             END IF;
//                     END LOOP;
//                 IF holiday = incoming_date THEN
//                     incoming_date = weekday_prior(incoming_date - 1::integer);
//                 END IF;
//             END IF;

//             -- Washington Birthday
//             IF month = 2 THEN
//                     count := 0;
//                     year := extract(''year'' from incoming_date);
//                     holiday := year||''-01-31'';
//                     WHILE count < 3 LOOP
//                             holiday := holiday + 1::integer;
//                             IF extract(''dow'' from holiday) = 1 THEN
//                                     count := count + 1;
//                             END IF;
//                     END LOOP;
//                 IF holiday = incoming_date THEN
//                                 incoming_date = weekday_prior(incoming_date - 1::integer);
//                         END IF;
//             END IF;

//             -- Memorial Day
//             IF month = 5 THEN
//                         year := extract(''year'' from incoming_date);
//                         work_date := year||''-05-01'';
//                         end_date := year||''-05-31'';
//                         WHILE work_date <= end_date  LOOP
//                                 IF extract(''dow'' from work_date) = 1 THEN
//                                         holiday := work_date;
//                                 END IF;
//                                 work_Date := work_date + 1::integer;
//                         END LOOP;
//                 IF holiday = incoming_date THEN
//                                 incoming_date = weekday_prior(incoming_date - 1::integer);
//                         END IF;
//             END IF;

//             -- Independence Day
//             IF month = 7 THEN
//                 year := extract(''year'' from incoming_date);
//                         holiday := weekday_closest((year||''-07-04'')::date);
//                 IF holiday = incoming_date THEN
//                                 incoming_date = weekday_prior(incoming_date - 1::integer);
//                         END IF;
//             END IF;

//             -- Labor Day
//             IF month = 9 THEN
//                         count := 0;
//                         year := extract(''year'' from incoming_date);
//                         holiday := year||''-08-31'';
//                         WHILE count < 1 LOOP
//                                 holiday := holiday + 1::integer;
//                                 IF extract(''dow'' from holiday) = 1 THEN
//                                         count := count + 1;
//                                 END IF;
//                         END LOOP;
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_prior(incoming_date - 1::integer);
//                         END IF;
//                 END IF;

//             -- Columbus Day
//             IF month = 10 THEN
//                         count := 0;
//                         year := extract(''year'' from incoming_date);
//                         holiday := year||''-09-30'';
//                         WHILE count < 2 LOOP
//                                 holiday := holiday + 1::integer;
//                                 IF extract(''dow'' from holiday) = 1 THEN
//                                         count := count + 1;
//                                 END IF;
//                         END LOOP;
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_prior(incoming_date - 1::integer);
//                         END IF;
//                 END IF;

//             -- Veterans Day
//             IF month = 11 THEN
//                 year := extract(''year'' from incoming_date);
//                         holiday := weekday_closest((year||''-11-11'')::date);
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_prior(incoming_date - 1::integer);
//                         END IF;
//             END IF;

//             -- Thanks Giving
//             IF month = 11 THEN
//                         count := 0;
//                         year := extract(''year'' from incoming_date);
//                         holiday := year||''-10-31'';
//                         WHILE count < 4 LOOP
//                                 holiday := holiday + 1::integer;
//                                 IF extract(''dow'' from holiday) = 4 THEN
//                                         count := count + 1;
//                                 END IF;
//                         END LOOP;
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_prior(incoming_date - 1::integer);
//                         END IF;
//                 END IF;

//             -- Christmas
//             IF month = 12 THEN
//                         year := extract(''year'' from incoming_date);
//                         holiday := weekday_closest((year||''-12-25'')::date);
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_prior(incoming_date - 1::integer);
//                         END IF;
//                 END IF;

//             return incoming_date;

//         END;
//         ' LANGUAGE plpgsql;

//         CREATE OR REPLACE FUNCTION business_day_next(date) RETURNS date AS '
//         DECLARE
//             incoming_date date;
//             work_date date;
//             end_date date;
//             holiday date;
//             year integer;
//             count integer;
//             month integer;
//         BEGIN
//             incoming_date := weekday_next($1);
//             month := extract(''month'' from incoming_date);

//             -- New Years Day 1
//             IF month = 1 THEN
//                 year = extract(''year'' from incoming_date);
//                 holiday := weekday_closest((year::text||''-01-01'')::date);
//                 IF holiday = incoming_date THEN
//                     incoming_date = weekday_next(incoming_date + 1::integer);
//                 END IF;
//             END IF;

//             -- New Years Day 2 (next year may be end of this year)
//             IF month = 12 THEN
//                 year = 1 + extract(''year'' from incoming_date);
//                 holiday := weekday_closest((year::text||''-01-01'')::date);
//                 IF holiday = incoming_date THEN
//                     incoming_date = weekday_next(incoming_date + 1::integer);
//                 END IF;
//             END IF;

//             -- Martin Luther King Day
//             IF month = 1 THEN
//                     count := 0;
//                     year := extract(''year'' from incoming_date) - 1::integer;
//                     holiday := year||''-12-31'';
//                     WHILE count < 3 LOOP
//                             holiday := holiday + 1::integer;
//                             IF extract (''dow'' from holiday) = 1 THEN
//                                     count := count + 1;
//                             END IF;
//                     END LOOP;
//                 IF holiday = incoming_date THEN
//                     incoming_date = weekday_next(incoming_date + 1::integer);
//                 END IF;
//             END IF;

//             -- Washington Birthday
//             IF month = 2 THEN
//                     count := 0;
//                     year := extract(''year'' from incoming_date);
//                     holiday := year||''-01-31'';
//                     WHILE count < 3 LOOP
//                             holiday := holiday + 1::integer;
//                             IF extract(''dow'' from holiday) = 1 THEN
//                                     count := count + 1;
//                             END IF;
//                     END LOOP;
//                 IF holiday = incoming_date THEN
//                                 incoming_date = weekday_next(incoming_date + 1::integer);
//                         END IF;
//             END IF;

//             -- Memorial Day
//             IF month = 5 THEN
//                         year := extract(''year'' from incoming_date);
//                         work_date := year||''-05-01'';
//                         end_date := year||''-05-31'';
//                         WHILE work_date <= end_date  LOOP
//                                 IF extract(''dow'' from work_date) = 1 THEN
//                                         holiday := work_date;
//                                 END IF;
//                                 work_Date := work_date + 1::integer;
//                         END LOOP;
//                 IF holiday = incoming_date THEN
//                                 incoming_date = weekday_next(incoming_date + 1::integer);
//                         END IF;
//             END IF;

//             -- Independence Day
//             IF month = 7 THEN
//                 year := extract(''year'' from incoming_date);
//                         holiday := weekday_closest((year||''-07-04'')::date);
//                 IF holiday = incoming_date THEN
//                                 incoming_date = weekday_next(incoming_date + 1::integer);
//                         END IF;
//             END IF;

//             -- Labor Day
//             IF month = 9 THEN
//                         count := 0;
//                         year := extract(''year'' from incoming_date);
//                         holiday := year||''-08-31'';
//                         WHILE count < 1 LOOP
//                                 holiday := holiday + 1::integer;
//                                 IF extract(''dow'' from holiday) = 1 THEN
//                                         count := count + 1;
//                                 END IF;
//                         END LOOP;
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_next(incoming_date + 1::integer);
//                         END IF;
//                 END IF;

//             -- Columbus Day
//             IF month = 10 THEN
//                         count := 0;
//                         year := extract(''year'' from incoming_date);
//                         holiday := year||''-09-30'';
//                         WHILE count < 2 LOOP
//                                 holiday := holiday + 1::integer;
//                                 IF extract(''dow'' from holiday) = 1 THEN
//                                         count := count + 1;
//                                 END IF;
//                         END LOOP;
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_next(incoming_date + 1::integer);
//                         END IF;
//                 END IF;

//             -- Veterans Day
//             IF month = 11 THEN
//                 year := extract(''year'' from incoming_date);
//                         holiday := weekday_closest((year||''-11-11'')::date);
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_next(incoming_date + 1::integer);
//                         END IF;
//             END IF;

//             -- Thanks Giving
//             IF month = 11 THEN
//                         count := 0;
//                         year := extract(''year'' from incoming_date);
//                         holiday := year||''-10-31'';
//                         WHILE count < 4 LOOP
//                                 holiday := holiday + 1::integer;
//                                 IF extract(''dow'' from holiday) = 4 THEN
//                                         count := count + 1;
//                                 END IF;
//                         END LOOP;
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_next(incoming_date + 1::integer);
//                         END IF;
//                 END IF;

//             -- Christmas
//             IF month = 12 THEN
//                         year := extract(''year'' from incoming_date);
//                         holiday := weekday_closest((year||''-12-25'')::date);
//                         IF holiday = incoming_date THEN
//                                 incoming_date = weekday_next(incoming_date + 1::integer);
//                         END IF;
//                 END IF;

//             return incoming_date;

//         END;
//         ' LANGUAGE plpgsql;

//         CREATE OR REPLACE FUNCTION tax_day_semiweekly(date) RETURNS date AS '
//         DECLARE
//                 work_date date;
//                 week_day integer;

//         BEGIN
//                 work_date := $1;
//                 week_day := extract (''dow'' from work_date);
//                 -- Sat, Sun, Mon, Tue => Friday else Wednesday
//                 IF week_day  = 6 OR week_day < 3 THEN
//                         WHILE extract(''dow'' from work_date) <>5 LOOP
//                                 work_date := work_date + 1::integer;
//                         END LOOP;
//                 ELSE
//                         work_date := work_date + 1::integer;
//                         WHILE extract(''dow'' from work_date)<>3 LOOP
//                                 work_date := work_date + 1::integer;
//                         END LOOP;
//                 END IF;
//                 return business_day_next(work_date);
//         END;
//         ' LANGUAGE plpgsql;

//         CREATE OR REPLACE FUNCTION tax_day_monthly(date) RETURNS date AS '
//         DECLARE
//                 work_date date;
//                 year integer;
//                 month integer;

//         BEGIN
//                 year := extract (''year'' from $1);
//                 month := extract (''month'' from $1);
//                 work_date := (year::text||''-''||month::text||''-15'')::date + interval ''1 month'';
//                 return business_day_next(work_date);
//         END;
//         ' LANGUAGE plpgsql;

//         CREATE OR REPLACE FUNCTION tax_day_quarterly(date) RETURNS date AS '
//         BEGIN
//                 return business_day_prior((date_trunc(''quarter'', $1)::date + interval ''4 months'' - interval ''1 day'')::date);
//         END;
//         'LANGUAGE plpgsql;

//         CREATE OR REPLACE FUNCTION tax_day_end_of_next_month(date) RETURNS date AS '
//         BEGIN
//                 return business_day_prior((date_trunc(''month'', $1)::date + interval ''2 month'' - interval ''1 day'')::date);
//         END;
//         'LANGUAGE plpgsql;

//         -- CREATE OR REPLACE FUNCTION business_days(num_days int DEFAULT 0, start_date date DEFAULT now()::DATE) RETURNS date AS $$
//         -- DECLARE
//         --     start_date date := $2;
//         --     num_days int := GREATEST(0, $1);
//         --     history int := 0;
//         -- BEGIN
//         --     WHILE num_days != 0 LOOP
//         --         IF start_date::DATE = business_day_prior(start_date)::DATE THEN
//         --             num_days := num_days - 1;
//         --         END IF;
//         --         history := history + 1;
//         --         start_date := (start_date - '1 day'::INTERVAL)::DATE;
//         --     END LOOP;
//         --     RETURN (now() - ((history) || 'days')::INTERVAL)::DATE;
//         -- END;
//         -- $$ LANGUAGE plpgsql;
//         `);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(/* sql */ `
//       DROP FUNCTION IF EXISTS weekday_prior(date);
//       DROP FUNCTION IF EXISTS weekday_next(date);
//       DROP FUNCTION IF EXISTS weekday_closest(date);
//       DROP FUNCTION IF EXISTS business_day_prior(date);
//       DROP FUNCTION IF EXISTS business_day_next(date);
//       DROP FUNCTION IF EXISTS tax_day_semiweekly(date);
//       DROP FUNCTION IF EXISTS tax_day_monthly(date);
//       DROP FUNCTION IF EXISTS tax_day_quarterly(date);
//       DROP FUNCTION IF EXISTS tax_day_end_of_next_month(date);
//       DROP FUNCTION IF EXISTS business_days(int, date);
//       `);
//   }
// }
