# Bug Fix Plan

## Identified Issues

### 1. Multiple Lockfile Conflict (Primary Issue)
**Severity:** Medium  
**Impact:** Development environment warning, potential build inconsistencies

The Next.js application is displaying a warning about multiple lockfiles:
- Project is using **npm** as the package manager (evidenced by [`package-lock.json`](../package-lock.json))
- A conflicting [`pnpm-lock.yaml`](../pnpm-lock.yaml) exists in the project directory
- Next.js detected another lockfile at `/Users/jamie/pnpm-lock.yaml` in the parent directory

This causes Next.js to infer the wrong workspace root, potentially leading to resolution issues.

### 2. TypeScript Configuration for React 19
**Severity:** Low  
**Impact:** Potential type checking issues with React 19

The [`tsconfig.json`](../tsconfig.json) currently uses `"jsx": "react-jsx"` which is correct for React 17+, but with React 19.2.0 installed, we should verify this is the optimal setting.

## Proposed Solutions

### Solution 1: Remove Conflicting Lockfile
**Action:** Delete [`pnpm-lock.yaml`](../pnpm-lock.yaml) from the project directory

**Rationale:**
- The project uses npm (npm commands are being used, `package-lock.json` exists)
- Having multiple lockfiles creates confusion for package managers and tools
- This will eliminate the Next.js warning

### Solution 2: Configure Turbopack Root Directory
**Action:** Update [`next.config.mjs`](../next.config.mjs) to explicitly set the Turbopack root

**Implementation:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
}

export default nextConfig
```

**Rationale:**
- Explicitly setting the root directory prevents Next.js from inferring incorrectly
- Silences the warning about workspace root detection
- Ensures consistent behavior across different environments

### Solution 3: TypeScript Configuration Review
**Action:** Verify the JSX configuration is optimal for React 19

**Current Setting:** `"jsx": "react-jsx"` in [`tsconfig.json`](../tsconfig.json)

**Analysis:**
- The current setting is correct for React 17+ including React 19
- Uses the new JSX transform (no need to import React in every file)
- No changes needed unless specific issues arise

### Solution 4: Address TypeScript Build Errors (Optional)
**Action:** Review and fix TypeScript errors instead of ignoring them

**Current Setting:** `ignoreBuildErrors: true` in [`next.config.mjs`](../next.config.mjs)

**Consideration:**
- Currently TypeScript build errors are being ignored
- This may hide real issues in the codebase
- Recommended to investigate and fix these errors for code quality
- This is a nice-to-have improvement, not a critical bug fix

## Implementation Order

1. **Remove [`pnpm-lock.yaml`](../pnpm-lock.yaml)** - Immediate fix for the warning
2. **Update [`next.config.mjs`](../next.config.mjs)** - Explicitly set Turbopack root directory
3. **Test the application** - Verify warning is resolved
4. **Review TypeScript errors** (optional) - Long-term code quality improvement

## Expected Outcomes

After implementing these fixes:
- ✅ Next.js warning about multiple lockfiles will be eliminated
- ✅ Development server will start cleanly without warnings
- ✅ Package resolution will be consistent and predictable
- ✅ Build process will be more reliable

## Testing Strategy

1. Delete [`pnpm-lock.yaml`](../pnpm-lock.yaml)
2. Update [`next.config.mjs`](../next.config.mjs) with turbopack configuration
3. Run `npm run dev` and verify no warnings appear
4. Check that the application runs correctly at http://localhost:3000
5. Verify hot module replacement (HMR) works as expected

## Notes

- The parent directory lockfile (`/Users/jamie/pnpm-lock.yaml`) is outside project scope and cannot be addressed here
- Setting the explicit root in Next.js config will prevent Next.js from looking outside the project directory
- If the parent lockfile needs to be removed, that should be done separately by the user
