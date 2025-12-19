/**
 * Compare feature constants
 *
 * These constants control the behavior of the timetable comparison feature,
 * including meal time windows and travel/meal gap calculations.
 */

// =============================================================================
// Meal Time Window Constants
// =============================================================================

/**
 * Available lunch start hour options (9am to 4pm).
 * Users can select when their lunch window begins within these hours.
 */
export const LUNCH_START_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

/**
 * Available lunch end hour options (11am to 6pm).
 * Users can select when their lunch window ends within these hours.
 */
export const LUNCH_END_HOURS = [11, 12, 13, 14, 15, 16, 17, 18];

/**
 * Available dinner start hour options (3pm to 8pm).
 * Users can select when their dinner window begins within these hours.
 */
export const DINNER_START_HOURS = [15, 16, 17, 18, 19, 20];

/**
 * Available dinner end hour options (5pm to 9pm).
 * Users can select when their dinner window ends within these hours.
 */
export const DINNER_END_HOURS = [17, 18, 19, 20, 21];

// =============================================================================
// Compare Utility Constants
// =============================================================================

/**
 * Buffer time in minutes for meal availability calculations.
 * A person is considered "available" for a meal if they have class within
 * this buffer before/after the meal window. This accounts for flexibility
 * in arriving early or staying late.
 */
export const MEAL_BUFFER_MINUTES = 30;

/**
 * Default minimum duration in minutes for a meal gap to be considered valid.
 * Two people need at least this much overlapping free time to eat together.
 */
export const DEFAULT_MEAL_GAP_DURATION = 60;

/**
 * Default maximum wait time in minutes for travel compatibility.
 * If two people's first/last classes differ by less than this amount,
 * they can travel together with one waiting for the other.
 */
export const DEFAULT_TRAVEL_WAIT_MINUTES = 15;
