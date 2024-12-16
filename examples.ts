import {bytesToBase64, decode} from "./ulid";

/**
 * input: "01JCJHNXPXV7C75VMGG0B70JT1"
 * output: {"_id": BinData(0, 'AZMlGvbd2dhy7pCAFnBLQQ==')}
 */
const printMongoBinarySearch = (ulid: string): void => {
  console.log(`{"_id": BinData(0, '${bytesToBase64(decode(ulid))}')}`);
};

/**
 * input: "01JCJHNXPXV7C75VMGG0B70JT1"
 * output: {
 *   "$binary": {
 *     "base64": "AZMlGvbd2dhy7pCAFnBLQQ==",
 *     "subType": "00"
 *   }
 * }
 */
const printMongoBinaryValue = (ulid: string): void => {
  console.log(JSON.stringify(
    {
      $binary: {
        base64: bytesToBase64(decode(ulid)),
        subType: "00",
      },
    },
    null,
    2,
  ))
};