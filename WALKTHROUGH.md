# Project Walkthrough: Transaction Cost Analysis Tool

This document is meant to help explain the project out loud, for example in an interview. It covers what the app does, why it was built the way it was, the reasoning behind each library choice, the interesting technical problems that came up, and the bugs that got caught along the way.

## The project in one paragraph

The Transaction Cost Analysis Tool is a React dashboard that measures how much it cost to execute a set of trades. A user loads a list of trade fills, either the built in sample data or their own CSV or Excel file, and the app compares each execution price to two benchmark prices to work out how much better or worse the fill was than the market. Those numbers are then rolled up into charts and a table, so it is easy to see which symbols, execution strategies, venues, or sides of the market were costing the most.

## Background: what transaction cost analysis is

When a trader decides to buy or sell a stock, there is a gap between the moment the decision is made and the moment the trade actually fills. During that gap the price can move, and even during the execution itself it can move against the trader. Transaction cost analysis, usually shortened to TCA, is the practice of measuring that gap in dollar or percentage terms so a trading desk can tell whether its execution is efficient.

The difference between the price that was expected and the price that was actually received is called slippage. Slippage is usually measured in basis points, where one basis point is one hundredth of a percent. Basis points make it possible to compare trades of very different sizes on the same scale, which raw dollar amounts do not.

Slippage can be measured against different benchmarks, and this app uses two of the most common ones.

The first is arrival price, the market price at the moment the order was sent to the market. Comparing a fill to the arrival price shows the total cost of the trade, including any cost that came from waiting to execute.

The second is VWAP, short for volume weighted average price. This is the average price the whole market traded at during the execution window, weighted by how much volume traded at each price. Comparing a fill to VWAP shows how the execution performed relative to the rest of the market over that same window, separate from any cost caused by delay before trading started.

## What the app does, screen by screen

At the top is a short explanation panel that describes slippage and the two benchmarks in plain language, since not everyone looking at the dashboard will know the vocabulary.

Below that is an upload area. A user can drag a CSV or Excel file of trades onto it, click it to browse for a file, or click a button to load a built in sample data set of about one hundred and sixty trades across ten symbols.

Under the upload area are three dropdown filters for symbol, side, and strategy. Changing any of them updates every chart and the table at the same time, because they all read from the same filtered data.

Next is a strip of summary figures, led by average slippage against arrival price: number of trades, total dollar notional, total shares, average slippage against arrival price, average slippage against VWAP, total dollar cost, and the percentage of trades that beat their benchmark.

Below the summary are five charts. Two are bar charts of average cost, one broken down by symbol and one by execution strategy. One is a histogram showing how slippage is distributed across all trades, with cost and price improvement in different colors. One plots each trade's slippage against its order size, which shows whether bigger orders tend to cost more. The last is a full width scatter chart of slippage over time, colored by buy or sell and sized by trade notional.

After that comes a portfolio composition section with three ranked lists: the share of notional routed through each execution venue, by market sector, and by market cap tier. Each row prints its percentage and dollar amount, so nothing depends on hovering.

At the bottom is the trade blotter, a sortable table listing every individual trade with its prices, quantity, computed slippage in basis points and dollars, and a status tag that flags whether the fill was notably good or bad.

Whatever set of trades is currently showing, after filters are applied, can also be exported back out as a CSV.

A button in the top right corner switches between the default dark terminal theme and a light theme, and the choice is remembered in the browser.

## How the code is organized

The project is split into three layers that each have a clear job.

The first layer is the type definitions in `src/types.ts`. They define what a raw trade record looks like coming in, what a trade looks like once its cost has been computed, and what the filter state looks like. Every other file builds on these same shapes.

The second layer is the calculation and data logic in `src/lib`. The file `tca.ts` holds the actual math: computing the cost of a single trade, grouping trades by symbol or strategy and averaging their cost weighted by trade size, building the overall summary statistics, and binning values for the histogram. None of this code touches React. It is plain functions that take data in and return data out, which makes the logic easy to reason about and easy to test on its own.

The same layer handles getting data into the app. The file `sampleData.ts` generates the demo trades with a seeded random number generator. File upload is split three ways: `csv.ts` turns raw CSV text into rows, `excel.ts` turns an uploaded spreadsheet into rows, and both hand those rows to the same validation function in `tradeRows.ts`. That way a CSV upload and an Excel upload are checked identically and cannot quietly drift apart. A small file, `fileImport.ts`, looks at the uploaded file's extension and decides which importer to call.

The third layer is the presentation code in `src/components`. Each visual piece of the dashboard, such as a stat tile, a chart, the upload panel, the filter bar, or the table, is its own component with its own small CSS file. Color choices live in a small set of shared CSS variables instead of being scattered across components, which is what made it practical to redesign the whole visual theme later.

`App.tsx` sits on top of all three layers. It holds the state (which trades are loaded and which filters are active) and uses `useMemo` so the filtered data and the aggregates are only recomputed when the trades or filters actually change. It then passes the results down to the components that draw them.

## Library choices and the reasoning behind them

**React.** The app is a single page dashboard made of many small, reusable pieces such as stat tiles, chart cards, and table rows. React's component model fits that well, and its built in hooks (`useState` and `useMemo` here) are enough for an app this size without adding a heavier state management library.

**TypeScript.** Financial data is a place where a silent bug is expensive. A misspelled field name, or a number that quietly turns into a string, should be caught while writing the code and not after it has put a wrong number on someone's screen. TypeScript enforces one shared shape for a trade record and for the derived cost fields across every file that touches them, so the compiler catches that kind of mistake right away.

**Vite.** Vite was chosen as the build tool and dev server because it starts almost instantly and shows code changes in the browser in well under a second. A lot of the work on this app was visual and needed constant checking in the browser, so a fast feedback loop mattered more than anything else a build tool offers.

**Recharts.** The app needs several chart types (bar charts, a histogram, and scatter charts), all with a consistent look and hover tooltips. Recharts builds charts by composing React components such as `BarChart`, `Bar`, and `Tooltip`, instead of writing raw SVG or working with a lower level library like D3. That kept the charting code declarative and consistent with the rest of the codebase, and made it easy to share one tooltip component and one card component across every chart.

**No backend.** All of the calculation happens in the browser in plain JavaScript functions. A server was not needed because the app does not have to persist data between sessions or share it between users. CSV import and export use the browser's built in File and Blob APIs, and Excel import uses a small dedicated library, so reading and downloading files never leaves the client.

**read-excel-file for spreadsheet uploads.** The obvious first choice for reading Excel files in the browser is `xlsx`, the SheetJS library, since it is the best known option. It turned out to be a poor fit. The version of `xlsx` published on the public npm registry has a couple of unpatched high severity vulnerabilities, because SheetJS stopped publishing fixed releases to npm and now distributes them only from their own site. Installing a package straight from an external URL instead of the registry is also something to be careful about, since it gives up the registry's provenance and audit trail. A second library, `exceljs`, was tried next and rejected because it pulled in a vulnerable dependency of its own and is a much heavier, Node oriented package than this app needs. `read-excel-file` was the right fit: it installs cleanly from npm with no known vulnerabilities, it is a fraction of the size because it only reads spreadsheets instead of also writing and styling them, and it has a dedicated browser build. The broader lesson is that the most famous library for a job is not automatically the right one, and that running `npm audit` after adding a dependency is worth doing as a habit.

**oxlint.** A fast linter written in Rust that came with the Vite React template. It catches common mistakes and enforces baseline code quality rules without much configuration.

## Design decisions

**The sign convention for cost.** One formula covers both buys and sells by multiplying the price difference by positive one for a buy and negative one for a sell. A positive result therefore always means the trade cost money compared to the benchmark, and a negative result always means it did better, regardless of which side of the market the trade was on. Without this there would be two separate formulas, and it would be easy to get the direction backwards in one of them.

**Weighting by notional instead of a plain average.** When averaging slippage across trades, each trade is weighted by its dollar value. A plain average would let a few tiny, oddly priced trades move the number as much as one very large trade, which is not how a trading desk thinks about cost.

**Deterministic sample data.** The sample generator uses a seeded pseudorandom number generator instead of `Math.random`, so the same trades appear every time the app loads. That keeps the numbers on screen consistent for demos, screenshots, and anyone comparing notes about the app.

**Keeping the math separate from the UI.** All cost calculations live in plain functions with no dependency on React. This was deliberate, so the logic can be reasoned about and tested independently of how it gets rendered.

**The visual theme.** The interface is styled after a classic Bloomberg terminal: a black background, amber and white text, a monospaced font, and sharp cornered panels, in place of the softer, rounded look the app started with. It is a deliberate stylistic choice, and it does trade away some of the color contrast guidance that would normally apply to a general audience dashboard in exchange for a recognizable aesthetic. The light theme exists for people who need more contrast. Both themes are sets of CSS variables, and the toggle only switches a `data-theme` attribute on the page, so no component had to change. The saved choice is applied by a tiny inline script before the first paint, which avoids a flash of the wrong theme on load.

**Strategy and venue naming.** The strategy list is `VWAP`, `TWAP`, `POV`, `Dark Aggregator`, and `Implementation Shortfall`. Earlier versions used `Market` and `Dark Pool` in place of the last two, but neither belongs on a list of execution algorithms. `Market` describes an order type, and `Dark Pool` describes a type of venue, and the app already has a separate venue field where a real dark pool name belongs. `Implementation Shortfall` is a genuine and very common algorithm category that tries to minimize slippage against the arrival price, which is exactly what this app's main benchmark measures, so the naming also lines up conceptually.

**Sector and market cap as reference data, not trade data.** Sector and cap tier describe the security and not the fill, so they live in a small lookup table (`refData.ts`) keyed by symbol instead of being extra columns in the uploaded file. This mirrors how a real TCA system works, where trade data is joined against a separate security master. It also means an uploaded file never has to supply sector or cap tier, and a symbol that is not in the table simply shows up as "Unclassified" in those two charts.

## Evaluating outside feedback

Partway through, the feature list grew based on suggestions from someone who works in FinTech. Most of the suggestions were solid and were built as described: a venue breakdown, a bubble chart relating order size to slippage, a running total of shares traded, and sector and market cap breakdowns. A few needed a closer look before any code was written.

One suggested venue was an exchange that no longer operates and was a cryptocurrency exchange to begin with, so it did not belong in an equity TCA tool. It was left out. Another suggestion was to show the venue breakdown as a pie chart, but with around ten venues the slices get too thin to compare by eye, so a sorted bar chart was used, which also matches the other charts in the app. A third point flagged one strategy name as not being a real strategy and proposed a replacement that was not a standard industry term either, so a different, real term was used instead.

The takeaway is that a domain expert's feedback is very valuable for catching things that would not otherwise get checked, but "an expert suggested it" is not the same as "it is correct as stated." Each suggestion was judged on its own merits, the uncertain ones were confirmed instead of guessed at, and the ones that did not hold up were changed and explained.

## Deployment and search visibility

The build output is a plain static site, so it can be hosted anywhere. GitHub Pages and Netlify are both configured. A GitHub Actions workflow lints, builds, and publishes to Pages on every push to `main`, a second workflow checks pull requests, and `netlify.toml` gives Netlify its build command, Node version, and response headers.

The main complication is that the same code has to work in several places. A GitHub Pages project site is served from `/<repo>/` while Netlify serves from the root, and search related tags such as the canonical link, the social preview image, the sitemap, and `robots.txt` all need absolute URLs that differ per host. Instead of hardcoding any of that, `vite.config.ts` reads the build environment (GitHub Actions, Netlify, or explicit overrides) to work out the base path and public URL, and a small plugin fills those into `index.html` and writes `robots.txt`, `sitemap.xml`, and a `404.html` during the build. The same plugin marks Netlify deploy previews as `noindex`, so throwaway preview URLs never compete with the real site in search results.

Other search work was ordinary but worth doing: a proper title and description, Open Graph and Twitter card tags with a generated preview image, JSON-LD structured data, real icons in place of the default Vite logo, a sensible heading structure with one `h1`, and lazy loading of the Excel parser so the first page load stays smaller. One honest limit is that search engines only read `robots.txt` at the root of a host, so it has no effect on a GitHub Pages project site. Also, the app draws itself in the browser, so it has limited text for search engines to rank compared to a content site.

## Interesting problems and bugs caught along the way

**Charts rendering as empty boxes in screenshots.** While testing in a headless browser, the bar charts sometimes showed up empty. The cause was Recharts' default animation: a screenshot taken mid animation, while the bars were still growing from zero, showed almost nothing. The fix was to turn off the growth animation on the bar and scatter charts. That also made the dashboard feel more responsive, because charts now update instantly when a filter changes instead of replaying an animation each time.

**Duplicate and negative zero axis labels.** The axis on a couple of bar charts showed labels like "1, 1, 1" for ticks that were actually slightly different decimals, and occasionally a stray "-0". The fix was to round tick labels to a fixed number of decimal places and to check for negative zero before formatting.

**Clipped chart labels.** Longer strategy names such as "Implementation Shortfall" were getting cut off on the left edge of the bar charts. The fix was widening the axis area and trimming the label font size slightly so the wrapped text fits.

**A market impact effect that was far too strong.** Larger orders are supposed to show worse slippage in the sample data, which is what makes the order size bubble chart tell a story. The first version of that formula pushed average cost up by almost ten times and dropped the share of trades that beat their benchmark from about a third to roughly one in ten. The sample desk looked like it was executing badly everywhere, instead of showing a believable size effect. The formula was recalibrated to a much smaller coefficient, the summary numbers were rechecked after each change, and tuning stopped once they were close to where they started while still leaving a visible relationship between size and cost.

**A market cap chart that was almost one solid bar.** Two lower priced stocks were added to the sample data so the market cap chart would show more than one category. Because their share prices were so much lower than the large cap names, giving them the same share counts made their dollar value barely register. The fix was to scale up their typical order size so their dollar notional per trade landed in a similar range, which is also realistic, since desks generally size orders around a target dollar amount and not a fixed number of shares. A follow up detail was that the market impact calculation had to be based on the unscaled order size, otherwise the cheaper stocks would have looked artificially high impact.

**Excel dates behaving differently from CSV dates.** A CSV date is always plain text, but an Excel cell formatted as a date comes back from the parsing library as a real JavaScript `Date` object. The shared validation function checks for that case and converts the `Date` into the same `YYYY-MM-DD` text the rest of the app expects, so both upload paths produce identical data.

**Hardcoded colors hiding in a few stylesheets.** When the light theme was added, most of the interface switched over automatically because it used shared color variables. A handful of leftovers did not: the table header background, the chart tooltip, and the text on the amber buttons were fixed to black or white. Left alone, they would have shown black table headers and tooltips on a light page. Each one was replaced with a variable, and both themes were checked visually across the charts and the blotter.

**A vulnerable dependency caught before it shipped.** As described in the library section, the first Excel library that was installed showed a high severity advisory in `npm audit`. It was removed and replaced instead of being accepted, and the final dependency set audits clean.

## Possible improvements

* Add automated tests for the calculation functions in `tca.ts`. They are pure functions, so they would be simple to test with known inputs and expected outputs.
* Add a fuller implementation shortfall calculation that also accounts for any part of an order that never got filled, not just the filled portion.
* Let a user choose their own benchmark instead of only arrival price and VWAP, for example a closing price benchmark.
* Replace the hardcoded sector and market cap table with a real reference data source, so any uploaded symbol resolves correctly instead of falling back to "Unclassified."
* Normalize the order size chart by average daily volume instead of raw share count, so a large order in a thinly traded name and a large order in a heavily traded name are not treated as equally big.
* Persist uploaded data, for example in the browser's local storage, so a refresh does not lose it.
* Pre-render the page at build time, or add a small amount of static content, so search engines see more than a single client rendered screen.
* Split the charting library into its own lazily loaded chunk to shrink the first page load further.
* Paginate or virtualize the trade blotter so it stays fast with a very large number of trades.
* Build a companion Python backtester whose output loads straight into this app, so the execution quality of a simulated strategy can be analyzed. The app's CSV format is the only integration point that project would need.

## A short demo flow

Start with the sample data and the summary tiles, since they give the overall picture. Then change a filter, for example switching side to Sell only, to show every chart and the table updating together. Point out the colors: red for a fill that cost money and cyan for a fill that beat its benchmark, used the same way throughout the app. Point out the slippage vs. order size chart, which tells a clear story on its own, with the bigger orders generally sitting higher on the cost axis. Finish by sorting the trade blotter by the cost column to show the best and worst individual fills, and mention that the filtered table can be exported as a CSV, and that a CSV or Excel file can be uploaded in place of the sample data.
