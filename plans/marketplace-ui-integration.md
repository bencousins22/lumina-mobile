# Marketplace UI Integration Plan

## 1. Overview
This document outlines the strategy for integrating the Agent Zero Marketplace into the existing React/Next.js frontend. The goal is to add a seamless "Marketplace" experience where users can discover, purchase, and install new agents directly into their Agent Zero environment.

## 2. Architecture & Navigation

### New Panel Entry
We will add a 6th main panel called **"Marketplace"**. This requires updating the global UI state and navigation components.

**Files to Modify:**
*   `components/providers.tsx`: Add `marketplace` to the `ActivePanel` type definition (if strictly typed) or ensure the state handles generic strings.
*   `components/main-app.tsx`: Add a new case for `marketplace` in the `renderPanel` switch statement and lazy load the component.
*   `components/navigation/mobile-navigation.tsx`: Add "Marketplace" to the `navItems` array with an appropriate icon (e.g., `ShoppingBag` or `Store` from `lucide-react`).
*   `components/navigation/mobile-sidebar.tsx`: Add the corresponding menu item.

### Directory Structure
We will create a new directory `components/marketplace/` to house all marketplace-related components, keeping the codebase modular.

```
components/marketplace/
├── marketplace-panel.tsx       # Main container
├── marketplace-header.tsx      # Search, Filters, User Balance
├── marketplace-grid.tsx        # Grid of agent cards
├── marketplace-card.tsx        # Individual agent card
├── agent-install-sheet.tsx     # Details & Install flow
└── categories-sidebar.tsx      # Desktop filtering
```

## 3. State Management

We will introduce a `useMarketplaceStore` (using Zustand) to manage the marketplace state, keeping it separate from the operational `agent-store` but bridging the two during installation.

**New Store:** `stores/marketplace-store.ts`
*   **State:**
    *   `availableAgents`: List of agents fetched from the marketplace API.
    *   `categories`: List of available categories.
    *   `filters`: Current search/filter state.
    *   `userBalance`: Current user credit/balance (mocked or real).
    *   `isLoading`: Async state.
*   **Actions:**
    *   `fetchMarketplaceAgents()`
    *   `installAgent(agentId)`: Triggers the backend installation and updates the `agent-store`.

## 4. UI/UX Design Patterns

The marketplace will reuse the existing design language (shadcn/ui) to ensure consistency.

*   **Layout:**
    *   **Mobile:** Vertical scroll with a sticky header for search. Categories as horizontal scroll pills or a filter sheet.
    *   **Desktop:** Sidebar for categories, main area for the grid.
*   **Cards:** Similar to `AgentsPanel` cards but emphasizing "Price", "Rating", and "Install" instead of "Status" and "Active Time".
*   **Detail View:** Use the `Sheet` component (Side: `bottom` on mobile, `right` on desktop) for agent details, screenshots, and reviews. This matches the `AgentDetailSheet` pattern.

## 5. Component Breakdown

### `MarketplacePanel`
The entry point. It checks for `isMobile` to determine if it should render the desktop sidebar layout or the mobile layout.

### `MarketplaceCard`
Displays:
*   Agent Icon/Avatar
*   Name & Version
*   Price (or "Free")
*   Brief Description
*   "Install" or "Purchased" Badge

### `AgentInstallSheet`
A rich detail view containing:
*   Full description (Markdown supported).
*   Capabilities list (using `A2AAgentCard` schema).
*   Pricing details.
*   "Install Agent" button.
    *   **Action:** When clicked, it calls `installAgent`.
    *   **Feedback:** Shows a loading spinner, then a success toast (using `sonner`/`use-toast`).
    *   **Redirect:** Optionally offers to switch to the "Agents" panel to see the newly installed agent.

## 6. Integration with Agent Zero Core

The marketplace isn't just a UI; it needs to talk to the backend.

1.  **Discovery:** The frontend will fetch the `agent.json` (A2A Card) definitions from a central repository or API endpoint.
2.  **Installation:**
    *   We will add a method to `AgentZeroClient` (or a new `MarketplaceClient`) to handle the download/clone process.
    *   Backend logic (implied): The backend receives a request to "install" an agent, which likely involves pulling a docker image or cloning a repo and registering it as a Project.
3.  **Monetization (Stripe):**
    *   The "Buy" button will trigger a payment intent if the agent is paid.
    *   For the prototype, this can be mocked or handled via a simple redirect/popup.

## 7. Implementation Steps

1.  **Scaffold:** Create the `components/marketplace` folder and the base `marketplace-panel.tsx`.
2.  **Navigation:** Hook up the new panel in `MainApp` and `MobileNavigation`.
3.  **Store:** Create `stores/marketplace-store.ts` with mock data initially.
4.  **UI Construction:** Build the `MarketplaceCard` and `MarketplaceGrid`.
5.  **Detail View:** Implement `AgentInstallSheet`.
6.  **Integration:** Connect the "Install" button to a mock function that adds the agent to the global `agents` list in `useAgentContext` (simulating installation).

## 8. Data Types (Extension)

We will extend `A2AAgentCard` for marketplace specific fields:

```typescript
import { A2AAgentCard } from "@/types/agent-zero"

export interface MarketplaceAgent extends A2AAgentCard {
  id: string
  price: number
  currency: string
  author: {
    name: string
    url?: string
  }
  rating: number
  downloads: number
  categories: string[]
  isInstalled?: boolean
}
```

This plan provides a non-destructive, modular way to add full marketplace functionality to the Agent Zero redesign.