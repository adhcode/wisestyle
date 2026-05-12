# CartButton Navigation Fix

## Issue
The CartButton component was not preventing navigation when used inside Link wrappers in components like:
- StyleAndSubstance (homepage)
- Sales page
- Other product listing components

When users clicked "Add to Bag" on these pages, they were being navigated to the product page instead of staying on the current page.

## Root Cause
The CartButton component's `handleAddToCart` function was not receiving the click event and therefore couldn't call `e.preventDefault()` and `e.stopPropagation()` to prevent the Link from navigating.

## Solution
Updated the CartButton component to:
1. Accept the click event as an optional parameter in `handleAddToCart`
2. Call `e.preventDefault()` and `e.stopPropagation()` when the event is present
3. This prevents the parent Link from navigating when the button is clicked

## Code Changes

### Before:
```typescript
const handleAddToCart = () => {
    const cartItem = { /* ... */ };
    addItem(cartItem, { showModal: true });
    onSuccess?.();
};
```

### After:
```typescript
const handleAddToCart = (e?: React.MouseEvent) => {
    // Prevent navigation if button is inside a Link
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const cartItem = { /* ... */ };
    addItem(cartItem, { showModal: true });
    onSuccess?.();
};
```

## Affected Components
This fix resolves the navigation issue in:
- ✅ StyleAndSubstance component (homepage)
- ✅ Sales page
- ✅ Any other component using CartButton inside a Link

## Testing
Test the following scenarios:
- [ ] Click "Add to Bag" on Style & Substance section (homepage) - should NOT navigate
- [ ] Click "Add to Bag" on Sales page - should NOT navigate
- [ ] Verify cart modal appears after clicking
- [ ] Verify button shows "ADDED TO BAG" state (if implemented)
- [ ] Verify cart counter updates
- [ ] Verify no toast notifications appear

## Result
Users can now add items to cart from any page without being navigated away, providing a seamless shopping experience.
