# Document Management UI

This project is a document management interface with a simple menu navigation, dynamically displaying content fetched from an API. It features a tree-like menu (main menus and submenus) on the left, while the right panel renders Markdown content corresponding to the selected submenu, presenting it with a modern aesthetic. It automatically formats form fields and highlights specific keywords from API responses to enhance readability.

## Features

* **Dynamic Menu Generation:** Menus and submenus are dynamically fetched from a REST API to construct the left-hand side menu tree.
* **Markdown Content Rendering:** Markdown-formatted content corresponding to the selected submenu is converted to HTML and displayed in the right panel.
* **Automatic Form Card Styling:** `<form>` tags found within the Markdown content are automatically wrapped and styled to appear as modern, shadowed "cards."
* **Keyword Highlighting:** Specific keywords (e.g., `okUrl`, `failUrl`, `TDS Merchant Gateway`, `HTML Form Post`, `browser-based`, `HTTP POST`) are automatically highlighted with a distinct color and background within the content.
* **Code Block Highlighting:** Thanks to the `highlight.js` library, code blocks in Markdown (e.g., ```html, ```csharp) are displayed with syntax highlighting. Inline code snippets (`` `code` ``) also receive a separate distinct styling.
* **Collapsible Menus (Accordion):** Main menu titles in the left sidebar are clickable, offering an accordion-like functionality to expand and collapse their respective submenus.
* **Modern and Responsive Design:** Utilizes contemporary CSS techniques for a clean and modern UI/UX. The design is responsive, adapting to various screen sizes.
* **API Integration:** All menu, submenu, and content data are fetched from a specified REST API endpoint.

## Technologies Used

* **HTML5:** The structural foundation of the project.
* **CSS3:** Visual styling and design, leveraging modern Flexbox and Grid layouts.
* **JavaScript (ES6+):** Handles dynamic content loading, menu management, Markdown processing, and DOM manipulation.
* **Marked.js:** Used for converting Markdown content to HTML.
* **Highlight.js:** For adding syntax highlighting to code blocks.
* **Font Awesome:** Provides scalable vector icons for menu expand/collapse functionality.
* **Google Fonts (Inter):** For a modern typography experience.

## Setup and Running

This project is a frontend application and needs to be served via a web server. The API backend must be running separately.

1.  **Clone the Repository:**
    ```bash
    git clone <project_repo_url>
    cd <project_folder>
    ```
2.  **Start the API Server:**
    For this UI to function, the associated API must be running. The local API addresses are defined in `document.js`:
    * `API_MENUS = 'https://localhost:7179/api/menus'`
    * `API_SUBMENUS = 'https://localhost:7179/api/submenus'`
    * `API_CONTENTS = 'https://localhost:7179/api/contents'`
    Please ensure your API project (e.g., a .NET Core Web API project) is running at the specified addresses.

## API Structure

The API exposes three main endpoints that return data in JSON format. These endpoints are crucial for dynamically building the document tree and its content. The data is interconnected through relationships.

1.  **`/api/menus`**
    Returns the main menu items. Each menu can contain one or more submenus.

    **Example JSON Response:**
    ```json
    [
      {
        "id": "1",
        "title": "Menu 1"
      },
      {
        "id": "2",
        "title": "Menu 2"
      }
    ]
    ```

2.  **`/api/submenus`**
    Returns the submenu items. Each submenu is associated with its parent menu via a `menuId`.

    **Example JSON Response:**
    ```json
    [
      {
        "id": "101",
        "menuId": "1",
        "title": "Submenu 1.1"
      },
      {
        "id": "102",
        "menuId": "1",
        "title": "Submenu 1.2"
      },
      {
        "id": "201",
        "menuId": "2",
        "title": "Submenu 2.1"
      }
    ]
    ```

3.  **`/api/contents`**
    Returns the document contents. Each content item is associated with its `submenuId` and contains text in Markdown format.

    **Example JSON Response:**
    ```json
    [
      {
        "id": "c1",
        "submenuId": "101",
        "text": "# Heading 1.1\\n\\nThis is the content for **Submenu 1.1**.\\n\\n```csharp\\npublic class Example\\n{\\n    public string Name { get; set; }\\n}\\n```\\n\\nForm example:\\n\\n<form action=\\\"/submit\\\" method=\\\"post\\\">\\n  <input type=\\\"text\\\" name=\\\"username\\\" placeholder=\\\"Username\\\"><input type=\\\"password\\\" name=\\\"password\\\" placeholder=\\\"Password\\\">\\n</form>\\n\\nHighlighting specific words: `okUrl` and `failUrl` are highlighted here."
      },
      {
        "id": "c2",
        "submenuId": "102",
        "text": "# Heading 1.2\\n\\nThis is different content for **Submenu 1.2**. `TDS Merchant Gateway` is an important term.\\n\\n* Item 1\\n* Item 2\\n\\n1. Step 1\\n2. Step 2"
      }
    ]
    ```

## Development Notes

* **HTTPS:** Since the API addresses use `https://localhost:7179`, ensure your local development environment has correctly configured HTTPS certificates. If necessary, provide certificate trust for `localhost` in your browser or system.
* **CORS:** Your API service must configure **CORS (Cross-Origin Resource Sharing)** settings to allow requests from the origin where the UI is running. Typically, in the API's startup configuration (e.g., `app.UseCors` or similar in .NET), permission should be granted to the UI's origin.
