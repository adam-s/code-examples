import { MigrationInterface, QueryRunner } from 'typeorm';

export class delta1619113605035 implements MigrationInterface {
  name = 'delta1619113605035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(`DROP TABLE "delta_entity"`);
      await queryRunner.query(`DROP TYPE "delta_entity_lag_enum"`);
    } catch (error) {
      console.log(error);
    }
    await queryRunner.query(
      `CREATE TYPE "delta_entity_lag_enum" AS ENUM('5', '15', '30', '45', '60', '120')`
    );
    await queryRunner.query(
      `CREATE TABLE "delta_entity" ("symbol" character varying(8) NOT NULL, "time" TIMESTAMP WITH TIME ZONE NOT NULL, "lag" "delta_entity_lag_enum" NOT NULL, "perChange" double precision NOT NULL, CONSTRAINT "PK_37daed29029de830da739880048" PRIMARY KEY ("symbol", "time"))`
    );

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS timescaledb;`);
    await queryRunner.query(
      `SELECT create_hypertable('delta_entity', 'time');`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX ON delta_entity (symbol, time DESC);`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "delta_entity"`);
    await queryRunner.query(`DROP TYPE "delta_entity_lag_enum"`);
  }
}
