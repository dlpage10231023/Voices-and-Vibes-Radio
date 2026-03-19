

## Issue Analysis

The BPM badge ("92 BPM · Afrobeats Jazz") IS rendering and visible on the RecordBar. The channel selector dropdown also works. However, the user wants all 8 channels to be **directly visible and clickable** on the bar itself, not hidden behind a dropdown toggle.

## Plan

### Modify `src/components/RecordBar.tsx`

1. **Remove the dropdown toggle button and dropdown panel** — delete the "♫ CH 03 ▾" button and the `showChannels` conditional dropdown. Remove `showChannels` state.

2. **Add a horizontal scrollable channel strip** between the center station info and the EQ bars section. Each channel appears as a compact clickable pill/badge showing:
   - Channel number (01-08)
   - Label (Jazz/Gospel/Signature/Soul/New)
   - Name (Healing Jazz, Gospel Groove, etc.)
   - BPM value
   - Active channel highlighted with teal border/background

3. **Keep the BPM badge** in the meta row — it updates dynamically to reflect the selected channel.

4. **Style the channel strip** to fit within the 100px bar height:
   - Small compact buttons (~18-20px tall) in a horizontal row
   - Scrollable if needed on smaller screens
   - Consistent with existing color scheme (teal `#009B9B`, coral `#E8624A`, dark backgrounds)
   - Font: Share Tech Mono, 7-8px size

### Technical Details

- File changed: `src/components/RecordBar.tsx`
- Remove `showChannels` state variable
- Replace the dropdown section with a horizontal flex row of 8 channel buttons
- Each button calls `setActiveChannel(idx)` on click
- Active channel gets `background: rgba(0,155,155,0.15)` and `border: 1px solid #009B9B`
- "New" label channels use coral `#E8624A`, others use teal `#009B9B`

