I've been developing this coding exercise on StackBlitz for convenience and to not require installing anything locally.  It was forked from the Vite template for a React/TypeScript application.  StackBlitz requires a chromium-based browser to use, such as Chrome or Edge, but it conveniently leaves my code publicly available at:
https://stackblitz.com/edit/vitejs-vite-lis1u4?file=src%2FApp.tsx&terminal=dev

A web container should automatically open with the running application.  Since a layout or resolution wasn't specified, I optimized the design for the sort of narrow vertical resolution provided by the web container.  The local URL of the web container can also be opened in a new tab while the terminal is running, in order to view the application on its own if preferred.

I used Highcharts to visualize the trading partner data, as it seemed reasonably intuitive to use and provides a clean, two-dimensional interactive graph that suits the purposes of the exercise.  This was made possible by simply adding the necessary dependencies to the package.json file.

I suggest using the company "pro face" to see the trading partners functionality, as it has a good network for visualizing and showing all the features.  Some companies don't have any trading partners, and some have more than is practical to visualize.

Blue nodes can be clicked to load their trading partners, red nodes already have them loaded, and yellow nodes are too deep to support loading.  I also use node size to indicate level.

Additional work that could be done if more time was spent is listed below:
- Further improve and refactor code
- Resolve editor warnings
- Explore better approaches to rendering cycles and state data
- Split into separate components?
- Search results paging (page size of 100 built into API...)
- Performance consideration, debouncing, explicit submit vs. automatic?
- Explore better approaches to API and forms
- Accessibility considerations, more appropriate markup tags
- API can return NaN values, which isn't parsable JSON...
- API does not populate trading_partners field?
- Clarify data to be presented, and if trading partners should include buyers too or just sellers
- Company names all lowercase?  Convert to title case?
- Clarify exact meaning of "3 levels deep"
- Make better use of TypeScript and data types/interfaces
- Refine layout and visual design (better support different resolutions/orientations)
- Ensure cross-platform consistency
- Loading spinner and other animations
- Improve indication for loading additional trading partners
- Security/sanitization?
- Explore graph configuration options/features
- Testing
- Documentation
