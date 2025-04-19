import {
  checkIdempotency,
  createIdempotency,
} from "../../../src/dao/ddb/emails";
import { SAMPLE_TRANSCRIPTION_IDEMPOTENCY_ID } from "../../constants";

describe("Emails idempotency integration test", () => {
  test("Should create an idempotency key", async () => {
    await createIdempotency(SAMPLE_TRANSCRIPTION_IDEMPOTENCY_ID);

    expect(
      checkIdempotency(SAMPLE_TRANSCRIPTION_IDEMPOTENCY_ID),
    ).resolves.toBeTruthy();
  });
});
