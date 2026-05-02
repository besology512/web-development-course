SWAPD352 Web Development

Lab #6 – Modern Web Architecture: The Next.js App Router

**Part 1 – Folder-Based Routing (The Entry Point)**

- Initialize the Project: Create a new Next.js app using npx create-next-app@latest.
- Create Static Routes: Inside the app/ directory, create a folder named dashboard and another named sensors.
- Define Pages: Create a page.tsx file inside each folder.
- The ”Private” Test: Add a file called InternalLogic.tsx inside the dashboard folder. Try to visit it in the browser.

**Part 2 – Nested Layouts (The Persistence Layer)**

- Define a Dashboard Layout: Create app/dashboard/layout.tsx.
- Implement the ”Children” Prop: Wrap the content in a Sidebar UI.
- Verify Inheritance: Visit /dashboard. Create /dashboard/settings/page.tsx and notice the sidebar persists.

**Part 3 – Dynamic Routing & Params (The Identity Tracker)**

- Create a Dynamic Route: Create the folder path app/sensors/[id]/page.tsx.
- Extract Parameters: Use the params prop to display the specific sensor ID.
- Test: Visit sensor pages with different IDs (e.g., /sensors/temp-001 and /sensors/motion-99).

**Part 4 – Client vs. Server Components (The Bound- ary)**

- The Server Component: Fetch a mock list of sensors directly in the function.
- The Client Component: Create a FilterButton.tsx in the same folder.
- Add ”Use Client” Directive: Add ’use client’ at the top of the file.
- Implement a Hook: Use useRouter to navigate when the button is clicked.

**Part 5 – Routing Metadata (The SEO Layer)**

- Static Metadata: Update the global title in app/layout.tsx.
- Dynamic Metadata: Export a generateMetadata function in [id]/page.tsx.

**Part 6 – Optimized Navigation: The <Link> Compo- nent**

- Implement Global Nav: Add a navigation bar using the <Link> component.
- The ”Flash” Test: Check that navigation happens without a full page reload.

**Part 7 – Route Groups & Organizational Privacy**

- Group by Context: Create a folder named app/(marketing) and move your home page into it.
- Verify URL: Visit localhost:3000/ to ensure the URL hasn’t changed.
- Private Utils: Create a folder app/sensors/*libandaddutilityfiles.*
- Attempt Access: Try to visit private folder URLs and notice they are blocked.

**Part 8 – Handling Async States: loading.tsx & error.tsx**

- Create a Delay: Simulate a slow IoT gateway in app/sensors/[id]/page.tsx.
- Implement the Skeleton: Create loading.tsx for immediate feedback.
- Test: Refresh the sensor page and observe the loading state before data appears.
2
