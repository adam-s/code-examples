/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class initialize1614331977914 implements MigrationInterface {
  name = 'initialize1614331977914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "yahoo_ticker" ("symbol" character varying(8) NOT NULL, "time" TIMESTAMP WITH TIME ZONE NOT NULL, "close" double precision, "open" double precision, "low" double precision, "high" double precision, "volume" integer, CONSTRAINT "PK_2c4fc25d8275d6415e28658b83d" PRIMARY KEY ("symbol", "time"))`
    );
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS timescaledb;`);
    await queryRunner.query(
      `SELECT create_hypertable('yahoo_ticker', 'time');`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX ON yahoo_ticker (symbol, time DESC);`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "yahoo_ticker"`);
  }
}
