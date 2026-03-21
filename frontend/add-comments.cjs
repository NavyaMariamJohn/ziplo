const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const rootFiles = ['index.html', 'vite.config.js', 'eslint.config.js', 'package.json'];

function getCommentText(filePath, ext) {
    const relPath = path.relative(__dirname, filePath).replace(/\\/g, '/');
    let description = '';

    if (relPath === 'index.html') {
        description = 'Main HTML entry point for the Ziplo application.';
    } else if (relPath === 'vite.config.js') {
        description = 'Vite configuration file for the React application.';
    } else if (relPath === 'eslint.config.js') {
        description = 'ESLint configuration for code quality and linting rules.';
    } else if (relPath === 'package.json') {
        // package.json cannot have comments
        return '';
    } else if (relPath.startsWith('src/components/dashboard/')) {
        const name = path.basename(filePath, ext);
        description = `Dashboard component for ${name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}. Used within the user or admin dashboard.`;
    } else if (relPath.startsWith('src/components/landing/')) {
        const name = path.basename(filePath, ext);
        description = `Landing page component for ${name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}. Part of the public-facing website.`;
    } else if (relPath.startsWith('src/components/ui/')) {
        const name = path.basename(filePath, ext);
        description = `Reusable UI component: ${name}. Provides generic UI functionality across the app.`;
    } else if (relPath.startsWith('src/components/layout/')) {
        const name = path.basename(filePath, ext);
        description = `Layout component: ${name}. Provides structural layout like headers or footers.`;
    } else if (relPath.startsWith('src/layout/')) {
        const name = path.basename(filePath, ext);
        description = `Global layout wrapper: ${name}. Defines the overall layout structure for specific sections (like Dashboard or full app).`;
    } else if (relPath.startsWith('src/pages/admin/')) {
        const name = path.basename(filePath, ext);
        description = `Admin page: ${name}. Accessible only to administrators for managing the platform.`;
    } else if (relPath.startsWith('src/pages/auth/')) {
        const name = path.basename(filePath, ext);
        description = `Authentication page: ${name}. Handles user login, registration, and related flows.`;
    } else if (relPath.startsWith('src/pages/dashboard/')) {
        const name = path.basename(filePath, ext);
        description = `Dashboard page: ${name}. Standard user dashboard view for managing links and viewing analytics.`;
    } else if (relPath.startsWith('src/pages/landing/')) {
        const name = path.basename(filePath, ext);
        description = `Public landing page: ${name}. The main entry point for unauthenticated visitors.`;
    } else if (relPath.startsWith('src/utils/')) {
        const name = path.basename(filePath, ext);
        description = `Utility module: ${name}. Provides helper functions used throughout the application.`;
    } else if (relPath.startsWith('src/services/')) {
        const name = path.basename(filePath, ext);
        description = `Service module: ${name}. Handles external API calls and business logic related to data fetching.`;
    } else if (relPath.startsWith('src/context/')) {
        const name = path.basename(filePath, ext);
        description = `React Context module: ${name}. Provides global state management for the application.`;
    } else if (relPath.startsWith('src/hooks/')) {
        const name = path.basename(filePath, ext);
        description = `Custom React Hook: ${name}. Encapsulates reusable component logic.`;
    } else if (relPath === 'src/main.jsx') {
        description = 'Main React entry point. Bootstraps the application and renders the root component.';
    } else if (relPath === 'src/App.jsx') {
        description = 'Root React component. Sets up routing and global providers for the application.';
    } else if (relPath === 'src/App.css') {
        description = 'Global styles specific to the App component and overall application structure.';
    } else if (relPath === 'src/index.css') {
        description = 'Global CSS file. Contains base styles, CSS variables, and resets for the entire application.';
    } else {
        const name = path.basename(filePath, ext);
        description = `File: ${name}. Part of the frontend application.`;
    }

    if (ext === '.jsx' || ext === '.js') {
        return `/**\n * @file ${path.basename(filePath)}\n * @description ${description}\n */\n`;
    } else if (ext === '.css') {
        return `/*\n * File: ${path.basename(filePath)}\n * Description: ${description}\n */\n`;
    } else if (ext === '.html') {
        return `<!--\n  File: ${path.basename(filePath)}\n  Description: ${description}\n-->\n`;
    } else {
        return '';
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.js', '.jsx', '.css', '.html'].includes(ext)) {
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has a file header comment
    // Only check if it already has our generated signature
    if (content.includes('@file ' + path.basename(filePath)) || content.includes('File: ' + path.basename(filePath))) {
        return;
    }

    const comment = getCommentText(filePath, ext);
    if (!comment) return;

    // For HTML, insert after the DOCTYPE if it exists
    if (ext === '.html' && content.trim().toLowerCase().startsWith('<!doctype html>')) {
        const spliceIndex = content.toLowerCase().indexOf('<html');
        if (spliceIndex !== -1) {
             content = content.substring(0, spliceIndex) + comment + content.substring(spliceIndex);
        } else {
             content = comment + content;
        }
    } else if (ext === '.jsx' || ext === '.js') {
        // Find the first line that is not an import or 'use client'/etc
        // Actually, just putting it at the very top is standard.
        // But some files might have 'use strict' or shebangs. Let's just put at the top.
        content = comment + '\n' + content;
    } else {
        content = comment + '\n' + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added comment to ${filePath}`);
}

// Process src directory
processDirectory(srcDir);

// Process root files
for (const file of rootFiles) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        processFile(fullPath);
    }
}
