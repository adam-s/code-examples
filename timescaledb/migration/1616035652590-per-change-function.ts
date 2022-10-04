import { MigrationInterface, QueryRunner } from 'typeorm';

export class perChangeFunction1616035652590 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `
            CREATE OR REPLACE FUNCTION per_change_fn (col1 float, col2 float)
            RETURNS float AS
            $$
                DECLARE x float;
                BEGIN
                    IF $1 = 0 THEN
                        x := 0;
                    ELSE
                        x := ROUND(CAST(100 * (($1 - $2) / $1) as NUMERIC), 3);
                    END IF;
                    RETURN x;
                END;
            $$
            LANGUAGE plpgsql;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `
            DROP FUNCTION per_change_fn(float, float);
        `);
  }
}
