
### 1. Project Goal & Core Functionality

**Primary Goal:** To develop a robust and user-friendly web application primarily focused on providing a clean, distraction-free, and highly responsive environment for reading webnovels.

**Core Functionality:**

*   **Immersive Reading Experience:**
    *   A dedicated reading view with minimal UI elements to maximize content visibility.
    *   Intuitive text flow and formatting.
*   **Novel Browsing & Discovery:**
    *   A landing page displaying a list or grid of available webnovels.
    *   Basic filtering/sorting options (e.g., by title, recently added).
*   **Seamless Chapter Navigation:**
    *   "Previous Chapter" and "Next Chapter" buttons for linear progression.
    *   A chapter list/dropdown within the reading view for direct jumps to any chapter.
*   **Dynamic Content Handling:**
    *   The application must dynamically load chapter content based on user selection.
    *   Ability to handle novels with varying chapter counts (tens to thousands).
    *   Mechanism to incorporate newly added chapters or novels without requiring application redeployment.
*   **User Interface Customization:**
    *   Toggle between Light and Dark (Night) mode for comfortable reading in different environments.
    *   Adjustable font size to cater to individual reader preferences.

---

### 2. UI/UX Requirements

The design philosophy will center on "content first" with a minimalist yet elegant aesthetic.

*   **Modern & Beautiful:**
    *   Clean typography and ample whitespace to reduce visual clutter.
    *   Subtle animations for transitions (e.g., chapter changes, mode toggles).
    *   A well-defined color palette that supports both light and dark modes gracefully.
    *   Focus on readability with carefully chosen font families (e.g., serif for body text, sans-serif for UI elements).
*   **Highly Responsive:**
    *   **Fluid Layouts:** Utilize CSS Flexbox and Grid for adaptable layouts that reflow content based on screen size.
        *   *Example:* On mobile, the main reading area will occupy full width; on desktop, it might be centered with generous side margins for focus.
    *   **Adaptive Navigation:**
        *   **Mobile:** Implement a "hamburger" menu for primary navigation (novel list, settings). Chapter navigation buttons will be prominently placed and touch-friendly.
        *   **Desktop:** Navigation elements (e.g., chapter list, settings) might be persistent in a sidebar or top bar.
    *   **Scalable Elements:** All interactive elements (buttons, sliders) will have appropriate tap targets for mobile devices. Text and images will scale proportionally, leveraging `rem` or `em` units and responsive image techniques (`srcset`, `picture` tags).
*   **Intuitive Navigation:**
    *   Clear visual hierarchy for novel titles, authors, and chapter numbers.
    *   Prominent and easy-to-discover navigation controls within the reading view.
    *   A progress indicator (e.g., "Chapter X of Y") within the reading view.
*   **Reading Customization:**
    *   **Day/Night Mode:** A clearly visible toggle switch (e.g., a moon/sun icon) accessible from the reading view or a settings menu. This will swap CSS variables for colors.
    *   **Font Size Adjustment:** A slider or discrete buttons (+/-) to increase/decrease font size within a predefined range, updating a CSS variable.

---

### 3. Data Storage & Management

#### File System vs. Database:

While storing raw content in plain text files is straightforward, for a dynamic web application, **migrating content to a database offers significant advantages:**

*   **Performance:** Databases are optimized for fast data retrieval, especially when querying specific chapters or filtering novels. Directly serving from a file system, while possible for small scales, can become inefficient as the number of files grows due to I/O overhead and lack of indexing.
*   **Scalability:** Databases easily handle large volumes of data and concurrent requests. Scaling a database is a well-understood problem (e.g., replication, sharding), whereas scaling file system access across multiple web servers can be complex.
*   **Searchability:** Databases excel at structured queries. You can easily search for novels by title, author, or even keyword search within chapter content if indexed. This is very difficult with plain text files without building a separate indexing service.
*   **Ease of Management:**
    *   **Metadata Integration:** All novel and chapter metadata (title, author, genre, chapter number, etc.) can be stored alongside the content, maintaining data integrity and consistency.
    *   **Atomic Updates:** Transactions ensure that updates (e.g., adding a new chapter) are either fully committed or rolled back, preventing data corruption.
    *   **Backup & Recovery:** Database backup and recovery tools are mature and robust.
*   **API Exposure:** A database-backed API can easily serve content in structured JSON, which is ideal for web and mobile clients.

**Proposed Database Solution: PostgreSQL (Relational Database)**

PostgreSQL is an excellent choice for this project due to:

*   **Reliability & Robustness:** It's known for its data integrity and advanced features.
*   **Scalability:** Highly scalable for both data volume and concurrent users.
*   **JSONB Support:** While relational, PostgreSQL's `JSONB` data type allows for flexible storage of semi-structured data (e.g., additional novel attributes), offering some of the flexibility of NoSQL when needed.
*   **Full-Text Search:** PostgreSQL has powerful built-in full-text search capabilities, which could be invaluable for future features like searching within novel content.
*   **Community & Ecosystem:** Large, active community and extensive tooling.

**Database Schema (Example):**

```sql
-- Novels Table
CREATE TABLE novels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE, -- e.g., 'hacker' for URL paths
    author VARCHAR(255),
    description TEXT,
    cover_image_url VARCHAR(512),
    genre_tags TEXT[], -- Array of text for tags
    total_chapters INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chapters Table
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    novel_id INT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title VARCHAR(512),
    content TEXT NOT NULL, -- The actual chapter text
    word_count INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (novel_id, chapter_number) -- Ensure unique chapter numbers per novel
);
```

#### Content Ingestion/Updates Strategy:

A hybrid approach is recommended for robustness and flexibility:

1.  **Periodic Background Scan (Automated):**
    *   A backend service (e.g., a cron job or a dedicated microservice) would periodically (e.g., every hour or daily) scan the `Books/` file system directory.
    *   It would compare the files found with the `novels` and `chapters` entries in the database.
    *   **New Novels:** If a new `WebNovel-Name` directory is found, it would parse its initial chapters and create a new `novel` entry and corresponding `chapter` entries.
    *   **New Chapters:** For existing `novel` entries, it would check for new `web-novel-slug-chapter-X-zn.txt` files (where `X` is greater than `total_chapters` in the DB) and insert them. It would also update the `total_chapters` count in the `novels` table.
    *   **File Naming Convention:** The consistent naming convention (`{web-novel-slug}-chapter-{chapter-number}-zn.txt`) is crucial for this scanner to correctly identify and order chapters.

2.  **Manual Trigger (Admin Panel):**
    *   An admin interface within the web application would provide a "Scan for New Content" button.
    *   This button would trigger the same background scan process immediately, useful for when content producers add new files and want them live quickly.

3.  **Dedicated API Endpoint (Future/Advanced):**
    *   For a more sophisticated setup, an API endpoint (e.g., `/admin/ingest-chapter`) could be exposed. This would allow external scripts or content management tools to push new chapter content directly to the database, bypassing the file system. This would require authentication and validation.

#### Metadata:

The `novels` and `chapters` tables in the proposed schema already include essential metadata:

*   **Novel Metadata:**
    *   `id`: Primary key.
    *   `title`: Full title of the novel.
    *   `slug`: URL-friendly identifier (derived from title, e.g., "Hacker").
    *   `author`: Author's name.
    *   `description`: Brief synopsis/summary.
    *   `cover_image_url`: URL to the novel's cover image (optional but good for UI).
    *   `genre_tags`: An array of keywords for categorization (e.g., `['Fantasy', 'Action', 'Isekai']`).
    *   `total_chapters`: Automatically updated by the ingestion process.
    *   `created_at`, `updated_at`: Timestamps for tracking.
*   **Chapter Metadata:**
    *   `id`: Primary key.
    *   `novel_id`: Foreign key linking to the parent novel.
    *   `chapter_number`: The sequential number of the chapter (crucial for ordering).
    *   `title`: Chapter specific title (e.g., "Chapter 1: The Beginning").
    *   `content`: The actual text of the chapter.
    *   `word_count`: (Optional) Can be useful for statistics or reading time estimates.
    *   `created_at`, `updated_at`: Timestamps.

**Metadata Storage & Update:**

*   **Initial Population:** The ingestion service will extract initial metadata from the file system (e.g., novel name from folder, chapter number from filename) and populate the database. More comprehensive metadata (description, genre tags, author) would ideally be added/edited via an admin interface once the novel is ingested.
*   **Updates:** `total_chapters` will be updated by the ingestion service. Other metadata like `description`, `author`, `genre_tags`, `cover_image_url` would typically be managed via a dedicated admin panel interacting with the backend API.

---

### 4. Technical Stack Proposal

This stack is chosen for its modern capabilities, strong community support, performance, and ability to deliver on the UI/UX requirements.

*   **Frontend Framework:** **React.js**
    *   **Justification:** React is a declarative, component-based library ideal for building complex, interactive, and highly responsive user interfaces. Its virtual DOM ensures efficient updates, leading to a smooth user experience. It has a vast ecosystem, mature state management libraries (e.g., Redux, Zustand), and excellent support for server-side rendering (SSR) if needed for SEO or initial load performance in the future.
*   **Backend Framework/Language:** **Node.js with NestJS (TypeScript)**
    *   **Justification:** Node.js provides a single-language full-stack development experience (JavaScript/TypeScript), reducing context switching. NestJS is a highly opinionated, scalable, and fully-fledged framework built on top of Express.js, inspired by Angular. It enforces a modular architecture, uses TypeScript extensively, and provides excellent support for building RESTful APIs, integrating with databases, and handling background tasks. Its dependency injection and module system make it highly maintainable and testable.
*   **Database:** **PostgreSQL**
    *   **Justification:** As detailed above, PostgreSQL is a robust, scalable, and feature-rich relational database perfectly suited for structured novel and chapter data, offering strong consistency, indexing, and full-text search capabilities.
*   **OR/M (Object-Relational Mapper): TypeORM or Prisma**
    *   **Justification:** Both are excellent ORMs for TypeScript/Node.js and PostgreSQL. They simplify database interactions by allowing developers to work with objects rather than raw SQL, improving developer productivity and reducing errors. Prisma also offers powerful schema migration tools.
*   **Deployment Platform:** **Vercel (Frontend) / Render or AWS EC2/ECS (Backend)**
    *   **Justification:** Vercel provides seamless deployment for React applications with built-in CDN, automatic SSL, and global edge network, ensuring fast load times. For the backend, Render offers a simple PaaS solution for deploying Node.js applications and PostgreSQL databases, while AWS (EC2/ECS) provides more granular control and scalability for larger operations.

---

### 5. High-Level Architecture & Flow

#### System Components:

1.  **Client (Frontend):**
    *   React.js application.
    *   Handles UI rendering, user interactions, routing, and state management.
    *   Communicates with the Backend API via HTTP requests (e.g., `fetch` or Axios).
2.  **Backend API (Server):**
    *   Node.js with NestJS.
    *   Exposes RESTful API endpoints for novel listing, chapter retrieval, settings updates, etc.
    *   Handles authentication (if user accounts are added later).
    *   Interacts with the Database via ORM.
    *   Contains the business logic.
3.  **Database:**
    *   PostgreSQL instance.
    *   Stores all novel metadata and chapter content.
4.  **Content Ingestion Service:**
    *   A background process (can be part of the Backend API or a separate microservice).
    *   Responsible for scanning the file system and populating/updating the database.
    *   Triggered periodically or manually via an admin endpoint.

#### User Flow (Example):

1.  **User lands on the homepage:**
    *   `Client` sends a GET request to `/api/novels` (Backend API).
    *   `Backend API` queries the `novels` table in `Database`.
    *   `Backend API` returns a list of novel metadata (title, author, cover, description) as JSON.
    *   `Client` renders the list of novels in a visually appealing grid/list.
2.  **User browses available novels:**
    *   User scrolls, filters, or sorts the displayed novels on the `Client`. All data is already loaded or fetched via additional API calls (e.g., `/api/novels?genre=fantasy`).
3.  **User selects a novel:**
    *   User clicks on a novel card.
    *   `Client` navigates to a novel detail page (e.g., `/novels/hacker`).
    *   `Client` sends a GET request to `/api/novels/hacker` (Backend API).
    *   `Backend API` retrieves the specific novel's metadata and its associated chapters (IDs, chapter numbers, titles) from `Database`.
    *   `Backend API` returns this data.
    *   `Client` renders the novel's description, list of chapters, and current total chapter count.
4.  **User selects a chapter:**
    *   User clicks on a specific chapter from the list or a "Read First Chapter" button.
    *   `Client` navigates to the reading view (e.g., `/novels/hacker/chapter/1`).
    *   `Client` sends a GET request to `/api/novels/hacker/chapter/1` (Backend API).
    *   `Backend API` queries the `chapters` table for the content of chapter 1 of the 'hacker' novel.
    *   `Backend API` returns the raw chapter text.
    *   `Client` receives the text and renders it in the dedicated reading area.
5.  **User reads the chapter and navigates:**
    *   User reads the content.
    *   When the user clicks "Next Chapter," `Client` updates its internal chapter number, then sends another GET request (e.g., `/api/novels/hacker/chapter/2`).
    *   The process repeats from step 4.
    *   The `Client` also provides UI for day/night mode toggle and font size adjustment, which are handled purely on the frontend by modifying CSS variables or classes.

#### Chapter Rendering:

1.  **Content Ingestion:** The `Content Ingestion Service` reads the plain text file (`.txt`), sanitizes it if necessary (e.g., removes any non-text characters or specific markers if they exist), and stores the raw text content directly into the `content` column of the `chapters` table in PostgreSQL.
2.  **Backend API Retrieval:** When a `Client` requests a chapter, the `Backend API` retrieves the `content` (plain text string) from the `chapters` table. It might perform some minimal server-side processing here, like ensuring consistent line breaks or encoding, but generally, it will return the raw text as stored.
3.  **Frontend Rendering:**
    *   The `Client` (React component) receives the raw text string.
    *   It will render this text within a `<div dangerouslySetInnerHTML={{ __html: processedText }}>` or similar, depending on whether the text might contain any simple HTML formatting (like `<b>` or `<i>` which is less likely for raw `.txt` files) or if you want to explicitly convert markdown-like syntax to HTML.
    *   For plain text, it's simpler: the text is just placed inside a `<p>` tag or a series of `<p>` tags if divided by double newlines. CSS styles (font-size, line-height, text-align, color) are then applied to this container.
    *   **Automatic Page Creation:** Since chapters are stored as complete text blocks, the "page creation" is handled by the browser's natural flow and CSS. New chapters are simply new database entries, and the frontend dynamically fetches and displays them. There are no "pages" in the traditional sense; it's a continuous scroll experience for each chapter.

---

### 6. Scalability & Future Considerations

#### Scalability:

The proposed architecture is designed with scalability in mind:

*   **Database Scaling:** PostgreSQL can be scaled vertically (more powerful server) or horizontally (read replicas, sharding for extreme cases). A single, well-provisioned PostgreSQL instance can handle millions of chapters and concurrent users for a webnovel application.
*   **Backend Scaling:** Node.js applications are highly performant and can be scaled horizontally by running multiple instances behind a load balancer. NestJS encourages modularity, making it easier to split into microservices if specific parts become bottlenecks.
*   **Frontend Scaling:** React applications are inherently scalable on the client side. The deployment on Vercel leverages CDNs, distributing content globally for fast access.
*   **Content Ingestion:** The ingestion service can be scaled independently or optimized to run efficiently on a schedule without impacting the main application's performance.

If the number of novels grows to thousands or hundreds of thousands:

*   **Database Indexing:** Ensure proper indexing on `novel_id`, `chapter_number`, and `title` columns for fast lookups.
*   **Caching:** Implement caching layers (e.g., Redis) for frequently accessed data like popular novel lists or recently read chapters.
*   **Optimized Queries:** Ensure all database queries are efficient.
*   **Search Engine:** For extensive search functionality (full-text search across all novels/chapters), consider integrating a dedicated search engine like Elasticsearch or Algolia alongside PostgreSQL's built-in full-text search.

#### Future Features & Considerations:

The chosen stack provides a strong foundation for future enhancements:

*   **User Accounts & Authentication:** Add user registration, login, and profiles.
*   **Reading Progress Tracking:** Store `user_id`, `novel_id`, `last_read_chapter`, and `scroll_position` in the database to allow users to resume reading where they left off across devices.
*   **Search Functionality:** Implement a robust search for novels by title, author, genre, or even within chapter content (leveraging PostgreSQL FTS or a dedicated search engine).
*   **Advanced Reading Customization:** More font options, line spacing, paragraph indentation, margin adjustments.
*   **Bookmarks/Highlights:** Allow users to bookmark specific sections or highlight text.
*   **Offline Reading:** Utilize Progressive Web App (PWA) features and Service Workers to cache chapters for offline access.
*   **User Reviews/Ratings:** Allow users to rate and review novels.
*   **Admin Panel:** A dedicated interface for managing novels, authors, genres, and triggering content ingestion.
*   **Monetization:** If desired, integrate advertising or subscription models.
*   **Community Features:** Comments sections on chapters, forums, etc.

This detailed plan provides a solid roadmap for building a modern, performant, and user-friendly webnovel reading application.