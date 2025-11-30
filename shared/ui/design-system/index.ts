import { createScopedLogger } from "../utils/logger"

const logger = createScopedLogger("design-system:index")

logger.debug("exports:initialising")

// Design tokens
export * from "./tokens/typography"
export * from "./tokens/spacing"
export * from "./tokens/colors"

// Theme utilities (including color utilities)
export * from "./theme/color-utils"
export * from "./theme/theme-utils"

// Styles entry points
export * from "./styles"

// Map curated atomic exports for convenience. Consumers can still import
// directly from `atoms`, `molecules`, or `organisms` for tree-shaking.
export * from "../atoms"
export * from "../molecules"
export * from "../organisms"

logger.debug("exports:ready")
