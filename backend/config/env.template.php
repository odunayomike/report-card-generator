<?php
/**
 * Environment Configuration
 * This file is auto-generated from environment variables
 */

// Get environment variables from Docker/Coolify
$backendUrl = getenv('BACKEND_URL') ?: 'http://localhost:8000';
$frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:5173';

// Base URLs
define('BACKEND_URL', $backendUrl);
define('FRONTEND_URL', $frontendUrl);

// API Base URL
define('API_URL', BACKEND_URL . '/api');

// Firebase Cloud Messaging (FCM) Server Key
define('FCM_SERVER_KEY', getenv('FCM_SERVER_KEY') ?: '');
