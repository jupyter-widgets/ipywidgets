// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { toByteArray, fromByteArray } from 'base64-js';

const hexTable = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '0A',
  '0B',
  '0C',
  '0D',
  '0E',
  '0F',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '1A',
  '1B',
  '1C',
  '1D',
  '1E',
  '1F',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '2A',
  '2B',
  '2C',
  '2D',
  '2E',
  '2F',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '3A',
  '3B',
  '3C',
  '3D',
  '3E',
  '3F',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '4A',
  '4B',
  '4C',
  '4D',
  '4E',
  '4F',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '5A',
  '5B',
  '5C',
  '5D',
  '5E',
  '5F',
  '60',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '6A',
  '6B',
  '6C',
  '6D',
  '6E',
  '6F',
  '70',
  '71',
  '72',
  '73',
  '74',
  '75',
  '76',
  '77',
  '78',
  '79',
  '7A',
  '7B',
  '7C',
  '7D',
  '7E',
  '7F',
  '80',
  '81',
  '82',
  '83',
  '84',
  '85',
  '86',
  '87',
  '88',
  '89',
  '8A',
  '8B',
  '8C',
  '8D',
  '8E',
  '8F',
  '90',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '98',
  '99',
  '9A',
  '9B',
  '9C',
  '9D',
  '9E',
  '9F',
  'A0',
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'A6',
  'A7',
  'A8',
  'A9',
  'AA',
  'AB',
  'AC',
  'AD',
  'AE',
  'AF',
  'B0',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'B8',
  'B9',
  'BA',
  'BB',
  'BC',
  'BD',
  'BE',
  'BF',
  'C0',
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'C8',
  'C9',
  'CA',
  'CB',
  'CC',
  'CD',
  'CE',
  'CF',
  'D0',
  'D1',
  'D2',
  'D3',
  'D4',
  'D5',
  'D6',
  'D7',
  'D8',
  'D9',
  'DA',
  'DB',
  'DC',
  'DD',
  'DE',
  'DF',
  'E0',
  'E1',
  'E2',
  'E3',
  'E4',
  'E5',
  'E6',
  'E7',
  'E8',
  'E9',
  'EA',
  'EB',
  'EC',
  'ED',
  'EE',
  'EF',
  'F0',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'FA',
  'FB',
  'FC',
  'FD',
  'FE',
  'FF'
];

/**
 * Convert an ArrayBuffer to a hex string.
 */
export function bufferToHex(buffer: ArrayBuffer): string {
  const x = new Uint8Array(buffer);
  const s = [];
  for (let i = 0; i < x.length; i++) {
    s.push(hexTable[x[i]]);
  }
  return s.join('');
}

/**
 * Convert a hex string to an ArrayBuffer.
 */
export function hexToBuffer(hex: string): ArrayBuffer {
  const x = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    x[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return x.buffer;
}

/**
 * Convert an ArrayBuffer to a base64 string.
 */
export function bufferToBase64(buffer: ArrayBuffer): string {
  return fromByteArray(new Uint8Array(buffer));
}

/**
 * Convert a base64 string to an ArrayBuffer.
 */
export function base64ToBuffer(base64: string): ArrayBuffer {
  return toByteArray(base64).buffer;
}

/**
 * A map that chunks the list into chunkSize pieces and evaluates chunks
 * concurrently.
 *
 * @param list - The list to map over
 * @param chunkOptions - The options for chunking and evaluating.
 * @param fn - The function to map, with the same arguments as an array map
 * @param thisArg - An optional thisArg for the function
 * @returns - the equivalent of `Promise.all(list.map(fn, thisArg))`
 */
export async function chunkMap<T, U>(
  list: T[],
  chunkOptions: chunkMap.IOptions,
  fn: (value: T, index: number, array: T[]) => Promise<U> | U,
  thisArg?: any
): Promise<U[]> {
  // Default to equivalent to Promise.all(list.map(fn, thisarg))
  const chunkSize = chunkOptions.chunkSize ?? list.length;
  const concurrency = chunkOptions.concurrency ?? 1;

  const results = new Array(list.length);
  const chunks: (() => Promise<void>)[] = [];

  // Process a single chunk and resolve to the next chunk if available
  async function processChunk(chunk: any[], start: number): Promise<void> {
    const chunkResult = await Promise.all(
      chunk.map((v, i) => fn.call(thisArg, v, start + i, list))
    );

    // Splice the chunk results into the results array. We use
    // chunkResult.length because the last chunk may not be full size.
    results.splice(start, chunkResult.length, ...chunkResult);

    // Start the next work item by processing it
    if (chunks.length > 0) {
      return chunks.shift()!();
    }
  }

  // Make closures for each batch of work.
  for (let i = 0; i < list.length; i += chunkSize) {
    chunks.push(() => processChunk(list.slice(i, i + chunkSize), i));
  }

  // Start the first concurrent chunks. Each chunk will automatically start
  // the next available chunk when it finishes.
  await Promise.all(chunks.splice(0, concurrency).map(f => f()));
  return results;
}

export namespace chunkMap {
  /**
   * The options for chunking and evaluating.
   */
  export interface IOptions {
    /**
     * The maximum size of a chunk. Defaults to the list size.
     */
    chunkSize?: number;

    /**
     * The maximum number of chunks to evaluate simultaneously. Defaults to 1.
     */
    concurrency?: number;
  }
}
