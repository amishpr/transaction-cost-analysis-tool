# UI upgrade review

This is a review of the dashboard's interface and the plan for the upgrade on the `ui-redesign` branch. The app was checked with Playwright 1.48 at 1440px and 390px wide in both themes, and the source for every component was read. The review covers typography, color, layout, chart design, interaction states, and accessibility.

## Direction

**Dark theme.** The Bloomberg terminal palette stays exactly as it is: black field, amber `#ff9900` chrome, off-white data, cyan for price improvement and buys, red for cost, amber for sells. Only layout, hierarchy, and chart details change in dark mode.

**Light theme.** The current light theme swaps amber for a generic corporate blue and loses the product's identity. The new light theme treats the page like a printout of the terminal: neutral paper, black ink for text and headings, and amber kept as the signature fill (the `<GO>` key, hovers, and the active theme button). Charts use a blue and red pair that was checked for colorblind separation.

**Density.** This is a working dashboard, so it stays compact. Nothing gets bigger spacing just for its own sake, and no decorative motion is added.

## Findings

### Light theme

1. The accent color is used for almost everything: the title, every panel title, every label, axis labels, legends, select text, borders, buttons, and the drop zone. With that much blue, nothing stands out, and the page reads like an unstyled code editor.
2. Cost figures use orange `#f17720` on a near white panel. That measures 2.76:1, which fails WCAG AA for text. It affects the headline KPIs, the blotter, and the status badges.
3. Three different roles (cost, serious, and critical) share the same orange, so the "High" badge and a normal cost look the same.
4. The page mixes a cool blue gray background with warm orange data. The grays in dark mode are warm, so the two themes do not feel related.
5. Panels are near white on a blue gray page with blue tinted borders. The result is low contrast between panel and page, yet the outlines are still busy.
6. The `<GO>` key is blue on white, which loses the terminal reference.
7. The browser theme color and the inline boot script still point at the old blue gray (`#eef1f6`).

### Layout and hierarchy (both themes)

1. The About panel sits above all data. On a phone it fills more than the first screen, so the dashboard starts about two screens down.
2. The subtitle repeats the product name ("TRANSACTION COST ANALYSIS, SLIPPAGE VS...") and uses an em dash.
3. Data source, filters, and export are spread over two rows. The drop zone takes a full row with a dashed border, and nothing shows which file is loaded after an upload.
4. The seven stat tiles wrap as five plus two on desktop, which leaves an empty half row. All seven have the same weight, so the headline number (average slippage vs arrival) does not stand out.
5. "Slippage vs. order size" sits under Portfolio composition even though it is about execution cost.

### Charts

1. The histogram's x axis repeats labels and shows `-0` (for example `-4, -4, -3 ... -1, -0, 1, 2, 2`). Bin edges start at the minimum value instead of round numbers.
2. The histogram's zero reference line never draws, because it points at a category that does not exist. Cost and improvement bins are also the same color.
3. Axis ticks land on odd values such as `0.7, 1.3, 2.6` and `15%, 17%` or `75%, 88%`.
4. Long category labels ("Implementation Shortfall", "Goldman Sachs Dark Pool", "Communication Services", "Consumer Discretionary") wrap onto two lines and collide with each other.
5. The "Slippage vs. order size" bubble chart plots symbol against average slippage, which is the "Cost by symbol" chart again with sized dots. Order size is never on an axis, so it cannot show market impact. The sample data models impact by clip size, and that relationship is currently invisible.
6. Bars have 4px rounded corners in an otherwise square design, and they are thick for the row height.
7. The three share breakdowns use a full chart with axes for what is really a ranked list, and the values are only available on hover.
8. Overlapping scatter points have no separating ring, so dense days turn into blobs.

### Trade blotter

1. Sortable column headers are `th` elements with click handlers. They cannot be reached with the keyboard, and nothing marks which columns sort.
2. Almost every row shows a "• NORMAL" badge, which is noise that hides the rows that matter.
3. A value of `+0.0` is colored as a cost.
4. Venue is in the data and the CSV export but not in the table.
5. Export CSV lives in the upload area, far from the table it exports.

### Controls, states, and accessibility

1. The drop zone is a `div` with a click handler, so keyboard users cannot upload a file.
2. There is no loading state while an Excel file is parsed, no confirmation of what was loaded, and no way to clear filters in one step.
3. When filters match no trades, the KPIs show zeros (colored as "good") and every chart renders empty axes.
4. The theme button shows the theme it will switch to, not the current one, which is ambiguous. The sun and moon icons are hand drawn.
5. The header sits inside `main`, and there is no footer.

### Typography and copy

1. The font stack is whatever monospace the system has (SF Mono, Consolas, or a Linux default), so the look changes by platform.
2. Sizes drift between 11, 11.5, 12, 12.5, and 13px with no clear scale.
3. The About copy uses an em dash and "i.e.".

## Plan

The work goes in this order so each step can be checked before the next one starts.

1. **Tokens and font.** Split the single `--amber` token into roles (heading, control, accent fill, accent text) so dark mode keeps amber everywhere while light mode can use ink. Add the new light palette below. Self host IBM Plex Mono through Fontsource (400, 500, 600) and set a small type scale.
2. **Header and control bar.** Plain subtitle without the repeated name. One control bar holds the data source (file name and trade count, upload button, sample button), the three filters, and a Clear button. Dropping a file anywhere on the page works, with an overlay.
3. **KPI strip.** One ruled strip with the headline metric emphasized. The layout is 8 columns on desktop, 4 on tablets, and 2 on phones, with no empty cells.
4. **Charts.** Shared tick and number helpers. Histogram bins on round edges, colored by cost or improvement. Axis width sized to the longest label. Square, thinner bars with value labels on the cost charts. A per trade "Slippage vs. order size" scatter replaces the bubble chart and moves into Execution cost. The timeline goes full width. The share breakdowns become ranked HTML bar lists that show share and notional directly.
5. **Blotter.** Keyboard sortable headers with `aria-sort`, a Venue column, badges only for non normal rows, a neutral zero, and Export CSV in the blotter header.
6. **States.** Loading state for uploads, an empty state with a Clear filters button, and the upload error announced with `role="alert"`.
7. **About section.** Move it below the blotter as "About this tool", add the required column list there, and link to it from the header.
8. **Docs.** Update the README theme description and project structure, and retake `docs/screenshot.png`.
9. **Check.** Lint, type check, build, and screenshots of both themes at desktop and phone width with no horizontal overflow and no console errors.

## New light palette

| Role | Value | Contrast on panel `#fcfcfa` |
|---|---|---|
| Page | `#f3f3ef` | |
| Panel | `#fcfcfa` | |
| Ink (text, headings) | `#141412` | 17.96 |
| Secondary text | `#4a4943` | 8.79 |
| Muted text | `#6d6c64` | 5.14 |
| Accent fill (with black text) | `#ff9900` | black on amber 9.81 |
| Accent text | `#a35400` | 5.34 |
| Cost text | `#b42318` | 6.40 |
| Improvement text | `#1d5fae` | 6.19 |
| Good badge | `#0b7d0b` | 5.17 |
| Warning badge | `#8a5a00` | 5.77 |
| Control border | `#8a897f` | 3.43 |

Chart marks were checked against the light panel with a colorblind simulation. Improvement blue `#2a78d6` and cost red `#d03b3b` pass every check (colorblind separation 23.8, normal vision 31.6, both above 3:1). Buy blue `#2a78d6` and sell amber `#d97a00` also pass (27.2 and 33.1).

## Left alone on purpose

* Every dark theme color value.
* SEO tags, structured data, the 404 page, and the deploy setup.
* The CSV and Excel parsing, the cost math, and the sample data generator.
* The section order for the dashboard data: KPIs, execution cost, composition, blotter.

## Status

Every step in the plan is done on the `ui-redesign` branch.

* `npm run lint` and `npm run build` pass. The main bundle is 2 KB larger gzipped than on `main`. The existing warning about a chunk over 500 KB comes from Recharts and React and was already there before this work.
* Playwright 1.48 screenshots of both themes at 1440px and 390px show no horizontal overflow and no console errors.
* An interaction script checked the theme switch, keyboard sorting, dropping a file on the page, the empty filter state, the error for a file with missing columns, and going back to the sample data.
* The trade blotter fits without scrolling at 1280px and wider, and scrolls sideways inside its panel on smaller screens.
* The README screenshot was retaken, a light theme screenshot was added next to it, and the social preview image was redrawn with the current name and a chart from the new layout. The old preview still said "TCA ANALYZER" from before the rename.
* The About section was later moved back to the top of the page, above the control bar, because the explanations read better before the data. The header link to it was removed since the section now starts right below the header. The column list from step 7 stays, and both README screenshots were retaken.
