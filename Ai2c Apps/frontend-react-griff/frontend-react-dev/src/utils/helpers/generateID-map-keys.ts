/**
 * Generates a unique identifier by combining a timestamp and a random string.
 *
 * This function creates a unique ID using the current timestamp and a cryptographically
 * secure random value to ensure uniqueness across different contexts, such as mapping keys.
 *
 * @returns {string} A unique identifier in the format "timestamp-randomValue".
 */
export const generateUniqueId = () => {
  // Get the current timestamp in milliseconds since Unix epoch
  const timestamp = Date.now();

  // Generate a cryptographically secure random 32-bit unsigned integer
  const randomStr = crypto.getRandomValues(new Uint32Array(1));

  // Combine timestamp and random value with a hyphen separator
  const id = `${timestamp}-${randomStr}`;

  // Return the generated unique ID
  return id;
};
