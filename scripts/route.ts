"use strict";

interface Routes {
    [key: string]: string; // Defines a dictionary where keys are route names and values are file paths
}

class Router {
    private routes: Routes;

    constructor(routes: Routes) {
        this.routes = routes;
        this.loadInitialRoute();
    }

    private loadInitialRoute(): void {
        window.addEventListener("hashchange", () => this.loadRoute());
        this.loadRoute(); // Load the first route when the page opens
    }

    private loadRoute(): void {
        const path: string = window.location.hash.replace("#", "") || "index";
        const route: string = this.routes[path] || this.routes["404"];

        fetch(route)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error. Status: ${response.status}`);
                }
                return response.text();
            })
            .then((html) => {
                const appElement = document.getElementById("app");
                if (appElement) {
                    appElement.innerHTML = html;
                } else {
                    console.error("App element not found in the DOM.");
                }
            })
            .catch((error) => {
                console.error("Error loading route:", error);
                const appElement = document.getElementById("app");
                if (appElement) {
                    appElement.innerHTML = "<h2>Page Not Found</h2>";
                }
            });
    }
}

// Define routes
const routes: Routes = {
    "index": "./index.html",
    "about": "./views/content/about.html",
    "events": "./views/content/events.html",
    "opportunities": "./views/content/opportunities.html",
    "contact": "./views/content/contact.html",
    "statistics": "./views/content/statistics.html",
    "404": "./views/content/404.html",
    "gallery": "./views/content/gallery.html",
    "service": "./views/content/service.html",
    "privacy": "./views/content/privacy.html",
};

// Initialize Router
document.addEventListener("DOMContentLoaded", () => {
    new Router(routes);
});