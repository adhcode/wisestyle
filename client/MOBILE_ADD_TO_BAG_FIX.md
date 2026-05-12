# Mobile Add to Bag Button Fix

## Issue
The TrendingNow section on the homepage was missing the "Add to Bag" button on mobile screens. The ProductCard component only showed the button on hover (desktop), which doesn't work on mobile devices.

## Solution
Added a dedicated mobile "Add to Bag" button below the product information in the ProductCard component, matching the design pattern used in the StyleAndSubstance component.

## Changes Made

### ProductCard Component (`client/src/components/ProductCard.tsx`)

Added a mobile-specific button section after the product name and price:

```tsx
{/* Mobile Add to Bag Button */}
<div className="mt-3 md:hidden">
    <button
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        className={`w-full py-2 border rounded-[4px] text-center text-[14px] font-medium transition-all ${
            isAddingToCart
                ? 'bg-[#006c2c] text-white border-[#006c2c] cursor-not-allowed'
                : 'border-[#D1B99B] text-[#3B2305] hover:bg-[#F9F5F0]'
        }`}
    >
        {isAddingToCart ? (
            <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                ADDED TO BAG
            </span>
        ) : (
            <span className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
            </span>
        )}
    </button>
</div>
```

## Features

### Desktop (md and above)
- Button appears on hover over the product image
- Slides up from bottom with smooth animation
- Hidden by default to maintain clean design

### Mobile (below md breakpoint)
- Button always visible below product info
- Matches StyleAndSubstance design
- Full width button with border
- Shows "ADDED TO BAG" state with checkmark icon

## Button States

1. **Default State**
   - Border: `#D1B99B`
   - Text: `#3B2305`
   - Background: White
   - Icon: Shopping bag

2. **Adding State** (2 seconds)
   - Background: `#006c2c` (dark green)
   - Text: White
   - Border: `#006c2c`
   - Icon: Checkmark
   - Text: "ADDED TO BAG"
   - Button disabled

3. **Hover State** (desktop)
   - Background: `#F9F5F0` (light beige)

## Affected Components

This fix applies to all components using ProductCard:
- ✅ TrendingNow section (homepage)
- ✅ ProductSection component
- ✅ Any other sections using ProductCard

## Consistency

The mobile button now matches the design pattern from:
- StyleAndSubstance component
- Sales page
- Other product listing pages

## User Experience

### Before
- Mobile users had no way to add items to cart from TrendingNow section
- Had to navigate to product page to add items

### After
- Mobile users can add items directly from TrendingNow section
- Button shows clear feedback with "ADDED TO BAG" state
- Cart modal appears with options to view bag or checkout
- No page navigation required

## Testing Checklist

- [ ] Mobile: Button visible on TrendingNow products
- [ ] Mobile: Button shows "ADDED TO BAG" when clicked
- [ ] Mobile: Cart modal appears after adding
- [ ] Mobile: No page navigation occurs
- [ ] Desktop: Button appears on hover
- [ ] Desktop: Mobile button is hidden
- [ ] Both: Cart counter updates correctly
- [ ] Both: Button prevents navigation when inside Link
