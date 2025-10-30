/*
 * Snowflake ID Generator (64-bit)
 *
 * Structure (64 bits):
 * 1 bit  - Sign (unused, always 0 for positive IDs)
 * 41 bits - Timestamp (milliseconds since custom epoch)
 * 5 bits  - Datacenter ID (0-31)
 * 5 bits  - Worker ID (0-31)
 * 12 bits - Sequence Number (0-4095 per millisecond)
 */

// --- Configuration ---

/**
 * Custom Epoch: 5 Feb 2025 0:00:00 IST (GMT+5:30)
 * This is the millisecond timestamp for new Date('2025-02-05T00:00:00+05:30').getTime()
 */
const CUSTOM_EPOCH = 1738693800000n;

// --- Bit Allocation (using bigint) ---
const WORKER_ID_BITS = 5n;
const DATACENTER_ID_BITS = 5n;
const SEQUENCE_BITS = 12n;

// --- Max Values (calculated from bit allocation) ---
const MAX_WORKER_ID = -1n ^ (-1n << WORKER_ID_BITS); // 31n
const MAX_DATACENTER_ID = -1n ^ (-1n << DATACENTER_ID_BITS); // 31n
const SEQUENCE_MASK = -1n ^ (-1n << SEQUENCE_BITS); // 4095n

// --- Bit Shifts (for assembling the ID) ---
const WORKER_ID_SHIFT = SEQUENCE_BITS; // 12n
const DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS; // 17n
const TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS; // 22n

// --- Internal State (for managing sequence numbers) ---
let lastTimestamp = -1n;
let sequence = 0n;

/**
 * Helper function to busy-wait until the next millisecond.
 * @param last - The last timestamp used.
 * @returns The new, incremented timestamp.
 */
const tilNextMillis = (last: bigint): bigint => {
  let current = BigInt(Date.now()) - CUSTOM_EPOCH;
  while (current <= last) {
    // Spin until the clock ticks over
    current = BigInt(Date.now()) - CUSTOM_EPOCH;
  }
  return current;
};

/**
 * Generates a new, unique 64-bit Snowflake ID.
 * This implementation uses random datacenter and worker IDs for each call.
 * @returns {bigint} A 64-bit Snowflake ID.
 */
const generate = (): bigint => {
  let relativeTimestamp = BigInt(Date.now()) - CUSTOM_EPOCH;

  // Check for clock drift
  if (relativeTimestamp < lastTimestamp) {
    throw new Error(
      `Clock moved backwards. Refusing to generate ID. Last: ${lastTimestamp}, Current: ${relativeTimestamp}`,
    );
  }

  if (relativeTimestamp === lastTimestamp) {
    // Same millisecond, increment sequence
    sequence = (sequence + 1n) & SEQUENCE_MASK;
    if (sequence === 0n) {
      // Sequence overflowed, wait for the next millisecond
      relativeTimestamp = tilNextMillis(lastTimestamp);
    }
  } else {
    // New millisecond, reset sequence
    sequence = 0n;
  }

  // Update last timestamp
  lastTimestamp = relativeTimestamp;

  // Generate random datacenter and worker IDs as requested
  // Note: In a real distributed system, these would be fixed per-process.
  const datacenterId = BigInt(
    Math.floor(Math.random() * Number(MAX_DATACENTER_ID + 1n)),
  );
  const workerId = BigInt(
    Math.floor(Math.random() * Number(MAX_WORKER_ID + 1n)),
  );

  // Assemble the final ID
  const id =
    (relativeTimestamp << TIMESTAMP_SHIFT) |
    (datacenterId << DATACENTER_ID_SHIFT) |
    (workerId << WORKER_ID_SHIFT) |
    sequence;

  return id;
};

/**
 * Verifies if a given ID is a *structurally valid* Snowflake ID
 * based on this module's custom epoch.
 *
 * It checks:
 * 1. It can be parsed as a positive BigInt.
 * 2. Its internal timestamp is at or after the custom epoch.
 * 3. Its internal timestamp is not unreasonably in the future.
 *
 * @param {bigint | string} id - The Snowflake ID to verify.
 * @returns {boolean} True if the ID is structurally valid, false otherwise.
 */
const verify = (id: bigint | string): boolean => {
  try {
    const idBigInt = BigInt(id);

    // 1. Must be a positive number.
    if (idBigInt <= 0n) {
      return false;
    }

    // 2. Extract the relative timestamp
    const relativeTimestamp = idBigInt >> TIMESTAMP_SHIFT;

    // 3. Calculate the absolute timestamp
    const timestamp = relativeTimestamp + CUSTOM_EPOCH;

    // 4. Check if timestamp is before our epoch.
    // (This also catches negative relative timestamps)
    if (timestamp < CUSTOM_EPOCH) {
      return false;
    }

    // 5. Check if timestamp is unreasonably in the future
    // (e.g., > 1 minute from now) to catch IDs from a different system.
    const oneMinute = 60000n;
    if (timestamp > BigInt(Date.now()) + oneMinute) {
      return false;
    }

    // If it passes all checks, it's structurally valid.
    return true;
  } catch (e) {
    // Failed to parse as BigInt (e.g., invalid string format)
    return false;
  }
};

// --- Export the public API ---

export const snowflake = {
  generate,
  verify,
};
