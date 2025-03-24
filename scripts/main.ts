/*
* INFT2202 - Assignment 3
* Student ID: 100948423 & 100589655
* Name: Bilgan Kiris & Mariah Laroco
* Date: March 22nd, 2025
*/

"use strict";

import { Chart, ChartConfiguration } from "chart.js";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import "@fullcalendar/core/main.css";

// Interfaces for type safety
interface VisitorStats {
    labels: string[];
    visitors: number[];
}

interface NewsArticle {
    title: string;
    description: string;
    url: string;
}

interface EventData {
    name: string;
    date: string;
    time: string;
    location: string;
    description: string;
}

// Utility function for AJAX requests
async function fetchData<T>(url: string): Promise<T> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
}

// Utility function to load HTML content into a specified element
async function loadHTMLContent(url: string, elementId: string): Promise<void> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }
        const data = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = data;
        } else {
            console.error(`Element with ID '${elementId}' not found.`);
        }
    } catch (error) {
        console.error(`Error loading content from ${url}:`, error);
    }
}

// Function to load the header and footer
function loadHeaderAndFooter(): void {
    loadHTMLContent("views/components/header.html", "header-placeholder")
        .then(() => {
            console.log("Header loaded successfully.");
            updateNavbar(); // Update the navbar after the header is loaded
        })
        .catch((error) => {
            console.error("Error loading header:", error);
        });

    loadHTMLContent("views/components/footer.html", "footer-placeholder")
        .then(() => {
            console.log("Footer loaded successfully.");
        })
        .catch((error) => {
            console.error("Error loading footer:", error);
        });
}

// Function to validate the event form
function validateEventForm(): boolean {
    const eventName = (document.getElementById("eventName") as HTMLInputElement).value.trim();
    const eventDate = (document.getElementById("eventDate") as HTMLInputElement).value.trim();
    const eventTime = (document.getElementById("eventTime") as HTMLInputElement).value.trim();
    const eventLocation = (document.getElementById("eventLocation") as HTMLInputElement).value.trim();
    const eventDescription = (document.getElementById("eventDescription") as HTMLTextAreaElement).value.trim();

    if (!eventName || !eventDate || !eventTime || !eventLocation || !eventDescription) {
        alert("All fields are required.");
        return false;
    }

    return true;
}

// Function to handle event form submission
function handleEventForm(): void {
    const eventForm = document.getElementById("eventForm") as HTMLFormElement | null;
    if (!eventForm) return;

    eventForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission

        if (!validateEventForm()) return;

        // Get form values
        const newEvent: EventData = {
            name: (document.getElementById("eventName") as HTMLInputElement).value.trim(),
            date: (document.getElementById("eventDate") as HTMLInputElement).value.trim(),
            time: (document.getElementById("eventTime") as HTMLInputElement).value.trim(),
            location: (document.getElementById("eventLocation") as HTMLInputElement).value.trim(),
            description: (document.getElementById("eventDescription") as HTMLTextAreaElement).value.trim(),
        };

        // Save event to localStorage
        const storedEvents = localStorage.getItem("events");
        const events: EventData[] = storedEvents ? JSON.parse(storedEvents) : [];
        events.push(newEvent);
        localStorage.setItem("events", JSON.stringify(events));

        // Clear the form
        eventForm.reset();

        // Display updated event list
        displayEvents();
    });
}

// Function to display events dynamically
function displayEvents(): void {
    const eventListContainer = document.getElementById("eventList");
    if (!eventListContainer) return;

    // Clear existing events
    eventListContainer.innerHTML = "";

    // Get events from localStorage
    const storedEvents = localStorage.getItem("events");
    const events: EventData[] = storedEvents ? JSON.parse(storedEvents) : [];

    // Display each event
    events.forEach((event) => {
        const eventElement = document.createElement("div");
        eventElement.classList.add("event");

        eventElement.innerHTML = `
            <h3>${event.name}</h3>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description}</p>
        `;

        eventListContainer.appendChild(eventElement);
    });
}

// Restrict access to logged-in users
function restrictAccess(): void {
    const username = localStorage.getItem("username");
    if (!username) {
        alert("Access Denied: Please log in first.");
        window.location.href = "login.html"; // Redirect to login page
    }
}

// Function to update the navbar based on login status
function updateNavbar(): void {
    const username = localStorage.getItem("username");

    const loginMenuItem = document.getElementById("loginMenuItem");
    const welcomeMenuItem = document.getElementById("welcomeMenuItem");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const logoutMenuItem = document.getElementById("logoutMenuItem");
    const statisticsMenuItem = document.getElementById("statisticsMenuItem");

    if (username) {
        if (loginMenuItem) loginMenuItem.style.display = "none";
        if (welcomeMenuItem) welcomeMenuItem.style.display = "block";
        if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${username}`;
        if (logoutMenuItem) logoutMenuItem.style.display = "block";
        if (statisticsMenuItem) statisticsMenuItem.style.display = "block";
    } else {
        if (loginMenuItem) loginMenuItem.style.display = "block";
        if (welcomeMenuItem) welcomeMenuItem.style.display = "none";
        if (logoutMenuItem) logoutMenuItem.style.display = "none";
        if (statisticsMenuItem) statisticsMenuItem.style.display = "none";
    }
}

// Function to handle logout
function handleLogout(): void {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("username");
            window.location.href = "index.html"; // Redirect to homepage
        });
    }
}

// Function to initialize the calendar
async function initializeCalendar(): Promise<void> {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
        console.error("Calendar element not found.");
        return;
    }

    try {
        // Fetch events from events.json
        const events = await fetchData<EventData[]>("data/events.json");

        // Initialize FullCalendar with fetched events
        const calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin],
            initialView: "dayGridMonth",
            events: events.map((event) => ({
                title: event.name,
                start: event.date,
                extendedProps: {
                    time: event.time,
                    location: event.location,
                    description: event.description,
                },
            })),
            eventClick: (info) => {
                // Display event details when clicked
                const event = info.event;
                const detailsContainer = document.getElementById("eventDetails");
                if (detailsContainer) {
                    detailsContainer.innerHTML = `
                        <h3>${event.title}</h3>
                        <p><strong>Date:</strong> ${event.start?.toISOString().split("T")[0]}</p>
                        <p><strong>Time:</strong> ${event.extendedProps.time}</p>
                        <p><strong>Location:</strong> ${event.extendedProps.location}</p>
                        <p><strong>Description:</strong> ${event.extendedProps.description}</p>
                    `;
                }
            },
        });

        calendar.render();
    } catch (error) {
        console.error("Error initializing calendar:", error);
    }
}

// Function to create a chart
function createChart(labels: string[], visitors: number[]): void {
    const canvas = document.getElementById("visitorChart") as HTMLCanvasElement | null;
    if (!canvas) {
        console.error("Canvas element with ID 'visitorChart' not found.");
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Failed to get 2D context for the canvas.");
        return;
    }

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Visitors per Day",
                    data: visitors,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

// Function to display the statistics page
async function displayStatisticsPage(): Promise<void> {
    console.log("Calling displayStatisticsPage()...");

    if (!localStorage.getItem("username")) {
        alert("Access Denied: Please log in first.");
        window.location.href = "login.html"; // Redirect if not authenticated
        return;
    }

    try {
        const data = await fetchData<{ labels: string[]; visitors: number[] }>("data/visitor_stats.json");
        createChart(data.labels, data.visitors);
    } catch (error) {
        console.error("Error fetching statistics:", error);
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("statistics.html")) {
        displayStatisticsPage();
    } else {
        restrictAccess(); // Restrict access to logged-in users
        loadHeaderAndFooter(); // Load header and footer
        updateNavbar(); // Update navbar based on login status
        handleEventForm(); // Handle event form submission
        displayEvents(); // Display existing events
        initializeCalendar(); // Initialize the calendar
    }
});