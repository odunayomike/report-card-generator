<?php
session_start();
echo "Session ID: " . session_id() . "\n";
echo "Session data: " . print_r($_SESSION, true) . "\n";
echo "Cookie: " . print_r($_COOKIE, true) . "\n";
