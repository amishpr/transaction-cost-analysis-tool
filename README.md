# TCA Analyzer

TCA Analyzer is a web dashboard for transaction cost analysis on equity trades. You give it a list of trade fills and it tells you how expensive those fills were compared to two standard benchmarks: the arrival price and the VWAP (volume weighted average price). The app computes the cost per trade, rolls it up by symbol, strategy, and side, and shows the results in a set of charts and a sortable table.

It runs entirely in the browser. There is no backend or database. You can either use the built in sample data or upload your own file of trades, as a CSV or an Excel spreadsheet (.xlsx or .xls).

## What the app shows you

* Summary stats: number of trades, total notional traded, total shares, average slippage against arrival price and VWAP (weighted by trade size), total dollar cost, and the percentage of trades that actually beat their benchmark.
* A bar chart of average cost by symbol.
* A bar chart of average cost by execution strategy (VWAP, TWAP, POV, Dark Aggregator, Implementation Shortfall).
* A histogram showing the distribution of slippage across all trades.
* A scatter chart plotting slippage over time, colored by buy or sell and sized by trade notional.
* A portfolio composition section: share of notional by execution venue, a bubble chart of average slippage versus total shares traded per symbol (to see whether bigger orders are costing more), and share of notional by sector and by market cap tier.
* A trade blotter table listing every trade with its computed cost in basis points and dollars, plus a status tag (Improved, Normal, Elevated, High).

You can filter everything by symbol, side, and strategy using the controls at the top, and export the currently filtered trades back out as a CSV. A button in the top right corner switches between the default dark terminal theme and a light theme, and the choice is remembered in the browser.

## Getting started

You need Node.js installed. Vite 8 requires version 20.19 or newer (or 22.12 or newer), and this project was built and tested on Node 24.

1. Install dependencies:

   ```
   npm install
   ```

2. Start the dev server:

   ```
   npm run dev
   ```

   This serves the app at `http://localhost:5180`. Open that in your browser. If that port is already taken, Vite picks the next free one and prints it.

3. When you are done, stop the server with Ctrl+C.

### Other commands

* `npm run build`: type checks the project and produces an optimized production build in the `dist` folder.
* `npm run preview`: serves the production build locally so you can check it before deploying.
* `npm run lint`: runs oxlint over the codebase.

## Uploading your own trades

The upload panel accepts either a CSV file or an Excel file (`.xlsx` or the older `.xls` format), with these columns:

```
id, date, symbol, side, quantity, arrivalPrice, execPrice, vwapPrice, venue, strategy
```

* `id`: any unique string for the trade.
* `date`: the trade date. In a CSV, use `YYYY-MM-DD` format. In an Excel file, either a real date-formatted cell or `YYYY-MM-DD` text both work.
* `symbol`: the ticker, for example `AAPL`.
* `side`: either `BUY` or `SELL`.
* `quantity`: number of shares.
* `arrivalPrice`: the market price at the moment the order was sent.
* `execPrice`: the average price the order actually filled at.
* `vwapPrice`: the volume weighted average price of the market during the execution window.
* `venue`: where the trade was executed, for example `NYSE` or `UBS`.
* `strategy`: the execution algorithm used, for example `VWAP`, `TWAP`, `POV`, `Dark Aggregator`, or `Implementation Shortfall`.

You can drag a file onto the drop zone or click it to browse for one. The app looks at the file extension to decide whether to parse it as CSV or Excel, so keep the real extension on the file. If a required column is missing or a numeric column cannot be parsed, the app shows an error message and does not change the loaded data.

Column order does not matter for either file type, since columns are matched by their header name. For a CSV file specifically, values cannot contain a literal comma, since the parser does not support quoted fields.

Symbol, side, and strategy in your file can be any values you want, the filters just read whatever distinct values show up in the data. Sector and market cap tier are looked up from a small built in reference table (see below) rather than being columns in the CSV, so a symbol you upload that is not in that table just shows up as "Unclassified" in those two breakdowns.

## Project structure

```
src/
  types.ts              Type definitions for trades, computed metrics, and filters
  lib/
    tca.ts               The cost calculations: per trade metrics, grouping, summary stats, histogram binning
    sampleData.ts         Generates the built in sample trades with a seeded random number generator
    tradeRows.ts           Shared row validation used by both the CSV and Excel importers
    csv.ts                  Parses uploaded CSV text and builds the CSV export
    excel.ts                 Parses uploaded Excel files (.xlsx / .xls)
    fileImport.ts              Picks CSV vs. Excel parsing based on the uploaded file's extension
    refData.ts                  Hardcoded symbol to sector / market cap tier lookup
    useTheme.ts                  Hook that stores and applies the light or dark theme
  components/
    AboutPanel.tsx        The explanation panel at the top of the page
    UploadPanel.tsx        The drag and drop upload area and sample data / export buttons
    FilterBar.tsx           Symbol, side, and strategy filters
    StatTile.tsx             The summary stat cards
    ChartCard.tsx             Shared card wrapper used around each chart
    ChartTooltip.tsx           Shared tooltip used by the charts
    CostByGroupChart.tsx       Bar chart of cost by symbol or by strategy
    ShareBreakdownChart.tsx    Bar chart of % of notional by venue, sector, or cap tier
    SymbolImpactBubbleChart.tsx  Bubble chart of average slippage vs. total shares per symbol
    SlippageHistogram.tsx      Distribution of slippage across trades
    SlippageTimeline.tsx       Scatter chart of slippage over time
    TradesTable.tsx             The sortable trade blotter
    ThemeToggle.tsx             The light / dark button in the header
  App.tsx                Top level layout and state (loaded trades, active filters)
  index.css              Color tokens for both themes, fonts, and other global styles
public/                  Favicon, app icons, social preview image, and web manifest
index.html               Page metadata for search engines and social sharing
vite.config.ts           Build settings, plus a plugin that writes robots.txt, sitemap.xml, and 404.html
netlify.toml             Netlify build settings and response headers
.github/                 GitHub Actions workflows (deploy and CI) and Dependabot settings
```

## Deploying

The build output in `dist` is a plain static site (HTML, CSS, and JavaScript), so it can be hosted anywhere. Configuration is included for GitHub Pages and Netlify.

### GitHub Pages

1. Push the repository to GitHub with `main` as the default branch.
2. In the repository, go to Settings, then Pages, and set the Source to "GitHub Actions".
3. Push to `main`, or run the "Deploy to GitHub Pages" workflow by hand from the Actions tab.

The workflow in `.github/workflows/deploy.yml` installs dependencies, lints, builds, and publishes `dist`. The site ends up at `https://<user>.github.io/<repo>/`. The build works out the `/<repo>/` base path on its own, and if the repository is named `<user>.github.io` it serves from the root instead.

A second workflow, `.github/workflows/ci.yml`, lints, type checks, builds, and audits dependencies on every pull request. Dependabot is set up to open weekly update pull requests for npm packages and for the actions themselves.

To use a custom domain, add it under Settings, then Pages, and then add two repository variables (Settings, Secrets and variables, Actions, Variables): `VITE_BASE` set to `/` and `VITE_SITE_URL` set to your full domain, such as `https://tca.example.com`.

### Netlify

1. In Netlify, choose Add new site, then Import an existing project, and pick the repository.
2. Leave the build settings alone. `netlify.toml` already sets the build command (`npm run build`), the publish directory (`dist`), Node 22, and the response headers (security headers, plus long lived caching for fingerprinted files in `/assets`).
3. Deploy.

Production deploys are indexable by search engines. Deploy previews and branch deploys are automatically marked `noindex` and blocked in their `robots.txt`, so they never compete with the real site in search results. Netlify supplies the site's primary URL during the build, which the app uses for its canonical links and sitemap, so no extra setup is needed even with a custom domain.

### Build settings

These environment variables are all optional. They can be set as GitHub repository variables or in the Netlify site settings.

* `VITE_BASE`: the path the site is served from. Defaults to `/`, or `/<repo>/` when building for a GitHub project page.
* `VITE_SITE_URL`: the full public URL of the site, used for canonical links, social preview links, the sitemap, and `robots.txt`. Defaults to the GitHub Pages URL, the Netlify site URL, or `http://localhost:5180` for a plain local build, so set this yourself if you deploy a local build by hand.
* `VITE_GOOGLE_SITE_VERIFICATION`: the token from Google Search Console for the verification meta tag (see below).

To check a GitHub Pages style build locally, run `VITE_BASE=/tca-analyzer/ npm run build` and then `VITE_BASE=/tca-analyzer/ npm run preview`, and open the address it prints.

## Search engine optimization

Everything that can be handled in code already is:

* A descriptive title and meta description, a canonical link, and a robots tag in `index.html`.
* Open Graph and Twitter card tags with a 1200 by 630 preview image (`public/og-image.png`), so links look right when shared.
* JSON-LD structured data describing the app as a `WebApplication`.
* A favicon, PNG app icons, an Apple touch icon, and a web manifest.
* `robots.txt`, `sitemap.xml`, and a `404.html` page, all written during the build so they always contain the correct absolute URLs for wherever the site is deployed.
* A proper heading structure (one `h1`, `h2` sections, `h3` chart titles), a `main` landmark, and a `noscript` fallback.
* The Excel parser is loaded only when someone uploads a spreadsheet, which keeps the first page load smaller.

Things that need a person, after the first deploy:

1. Add the site in Google Search Console as a URL prefix property. Choose the HTML tag verification method, copy the token from the `content` value, set it as `VITE_GOOGLE_SITE_VERIFICATION`, redeploy, and click Verify.
2. Under Sitemaps in Search Console, submit `sitemap.xml`.
3. Use URL Inspection on the home page and choose Request indexing.
4. Paste the site address into a social preview checker to confirm the card image and text look right.

Two limits are worth knowing about. First, search engines only honor `robots.txt` at the root of a host. A GitHub Pages project site lives under `/<repo>/`, so its `robots.txt` is not at the root and will be ignored. That is harmless for a site that wants to be indexed, and submitting the sitemap in Search Console still works, but a custom domain, a `<user>.github.io` repository, or Netlify all avoid the issue. Second, the app draws itself in the browser. Google runs JavaScript, so it can read the page, but a single screen app has limited text to rank on, and backlinks (for example from the GitHub repository description and README) matter more than any tag.

## How the cost calculation works

For every trade, the app compares the execution price to two benchmark prices and expresses the difference in basis points (1 basis point equals 0.01 percent of price) and in dollars.

The sign of the result always follows the same rule: a positive number means the fill cost more than the benchmark, a negative number means it beat the benchmark. This works the same way for both buys and sells because the formula flips sign based on the side of the trade. For a buy, paying more than the benchmark is a cost. For a sell, receiving less than the benchmark is a cost.

Aggregates (cost by symbol, by strategy, and the overall summary) are weighted by the dollar notional of each trade rather than averaged plainly, so a handful of very small trades with unusual slippage do not distort the picture.

## Notes on Excel support

Excel files are parsed with the `read-excel-file` library. An earlier attempt used the more well known `xlsx` (SheetJS) package, but the version currently published on the public npm registry has a couple of unpatched high severity advisories (SheetJS stopped shipping fixed versions to npm and now only publishes them from their own site). `read-excel-file` has no known vulnerabilities, is much smaller, and is built for reading spreadsheets in the browser specifically, which is all this app needs.

## Notes on the sample data and reference data

The sample strategies are `VWAP`, `TWAP`, `POV`, `Dark Aggregator`, and `Implementation Shortfall`. These are named to match what execution desks actually call their algo strategies. An earlier version of this app used `Market` and `Dark Pool` here, but those are an order type and a venue concept respectively, not algo strategy names, so they were renamed.

Sector and market cap tier are not something you would normally get from a trade fill itself. They come from `src/lib/refData.ts`, a small hardcoded table mapping each sample symbol to a sector and a cap tier. A real system would pull this from an actual security master or market data feed instead of a hardcoded table. The sample also includes two smaller names (`PRGO` and `OXM`) alongside the usual mega cap tickers, so the sector and market cap breakdown charts have something to show besides one giant bar.

## Notes on the visual design

The default interface is styled to look like a classic Bloomberg terminal: a black background, an amber and white color scheme, a monospaced font, and sharp cornered panels. This was a deliberate stylistic choice rather than the default look, and it trades off some of the color contrast guidance you would normally follow for a general purpose dashboard in exchange for that specific aesthetic.

For people who prefer or need higher contrast, a toggle in the top right corner switches to a light theme with the same layout, using a paper background, dark ink, and the same amber accent as the dark theme. Both themes are defined as sets of CSS variables in `src/index.css`, and a small script in `index.html` applies the saved choice before the first paint so the page does not flash the wrong theme on load.
