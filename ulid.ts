// The encoding and decoding arithmetics are based on the implementation of RobThree
// https://github.com/RobThree/NUlid/blob/89f5a9fc827d191ae5adafe42547575ed3a47723/NUlid/Ulid.cs#L168

export const constants = {
  REPR_LEN: 26,
  TIMESTAMP_REPR_LEN: 10,
  RANDOMNESS_REPR_LEN: 16,
};

export const ENCODE = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Base32 character set
export const DECODE = [
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x01, 0x02, 0x03,
  0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0xff, 0x12, 0x13, 0xff, 0x14,
  0x15, 0xff, 0x16, 0x17, 0x18, 0x19, 0x1a, 0xff, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10,
  0x11, 0xff, 0x12, 0x13, 0xff, 0x14, 0x15, 0xff, 0x16, 0x17, 0x18, 0x19, 0x1a,
  0xff, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
];

export function decode(encoded: string): Buffer {
  if (encoded.length !== constants.REPR_LEN) {
    throw new Error("Encoded ULID has to be exactly 26 characters long.");
  }
  for (const char of encoded) {
    if (!ENCODE.includes(char)) {
      throw new Error(`Encoded ULID can only consist of letters in ${ENCODE}.`);
    }
  }

  return Buffer.concat([
    decodeTimestamp(encoded.slice(0, constants.TIMESTAMP_REPR_LEN)),
    decodeRandomness(encoded.slice(constants.TIMESTAMP_REPR_LEN)),
  ]);
}

export function decodeTimestamp(encoded: string): Buffer {
  if (encoded.length !== constants.TIMESTAMP_REPR_LEN) {
    throw new Error("ULID timestamp has to be exactly 10 characters long.");
  }
  const lut = DECODE;
  const values = Buffer.from(encoded, "ascii");

  // @ts-expect-error TS2538
  if (lut[values[0]] > 7) {
    throw new Error(
      `Timestamp value ${encoded} is too large and will overflow 128-bits.`,
    );
  }

  const decoded = [
    // @ts-expect-error TS2538
    ((lut[values[0]] << 5) | lut[values[1]]) & 0xff,
    // @ts-expect-error TS2538
    ((lut[values[2]] << 3) | (lut[values[3]] >> 2)) & 0xff,
    // @ts-expect-error TS2538
    ((lut[values[3]] << 6) | (lut[values[4]] << 1) | (lut[values[5]] >> 4)) &
      0xff,
    // @ts-expect-error TS2538
    ((lut[values[5]] << 4) | (lut[values[6]] >> 1)) & 0xff,
    // @ts-expect-error TS2538
    ((lut[values[6]] << 7) | (lut[values[7]] << 2) | (lut[values[8]] >> 3)) &
      0xff,
    // @ts-expect-error TS2538
    ((lut[values[8]] << 5) | lut[values[9]]) & 0xff,
  ];
  return Buffer.from(decoded);
}

export function decodeRandomness(encoded: string): Buffer {
  if (encoded.length !== constants.RANDOMNESS_REPR_LEN) {
    throw new Error("ULID randomness has to be exactly 16 characters long.");
  }
  const lut = DECODE;
  const values = Buffer.from(encoded, "ascii");

  return Buffer.from([
    // @ts-expect-error TS2538
    ((lut[values[0]] << 3) | (lut[values[1]] >> 2)) & 0xff,
    // @ts-expect-error TS2538
    ((lut[values[1]] << 6) | (lut[values[2]] << 1) | (lut[values[3]] >> 4)) &
      0xff,
    // @ts-expect-error TS2538
    ((lut[values[3]] << 4) | (lut[values[4]] >> 1)) & 0xff,
    // @ts-expect-error TS2538
    ((lut[values[4]] << 7) | (lut[values[5]] << 2) | (lut[values[6]] >> 3)) &
      0xff,
    // @ts-expect-error TS2538
    ((lut[values[6]] << 5) | lut[values[7]]) & 0xff,
    // @ts-expect-error TS2538
    ((lut[values[8]] << 3) | (lut[values[9]] >> 2)) & 0xff,
    // @ts-expect-error TS2538
    ((lut[values[9]] << 6) | (lut[values[10]] << 1) | (lut[values[11]] >> 4)) &
      0xff,
    // @ts-expect-error TS2538
    ((lut[values[11]] << 4) | (lut[values[12]] >> 1)) & 0xff,
    // @ts-expect-error TS2538
    ((lut[values[12]] << 7) | (lut[values[13]] << 2) | (lut[values[14]] >> 3)) &
      0xff,
    // @ts-expect-error TS2538
    ((lut[values[14]] << 5) | lut[values[15]]) & 0xff,
  ]);
}

export function bytesToBase64(bytes: Buffer): string {
  return btoa(String.fromCharCode(...bytes));
}
