import { MigrationInterface, QueryRunner } from 'typeorm';

export class yahooTicker1616035721673 implements MigrationInterface {
  name = 'yahooTicker1616035721673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "yahoo_ticker_time_idx"`);
    await queryRunner.query(`DROP INDEX "yahoo_ticker_symbol_time_idx"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "yahoo_ticker_symbol_time_idx" ON "yahoo_ticker" ("symbol", "time") `
    );
    await queryRunner.query(
      `CREATE INDEX "yahoo_ticker_time_idx" ON "yahoo_ticker" ("time") `
    );
  }
}
