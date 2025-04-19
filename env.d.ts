declare namespace NodeJS {
  interface ProcessEnv {
    DDB_TABLE_NAME: string;
    DDB_IDEMPOTENCY_TABLE_NAME: string;
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
  }
}
