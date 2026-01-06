#!/bin/bash
set -e

# Export all environment variables to Apache
echo "PassEnv FRONTEND_URL" >> /etc/apache2/apache2.conf
echo "PassEnv BACKEND_URL" >> /etc/apache2/apache2.conf
echo "PassEnv DB_HOST" >> /etc/apache2/apache2.conf
echo "PassEnv DB_NAME" >> /etc/apache2/apache2.conf
echo "PassEnv DB_USER" >> /etc/apache2/apache2.conf
echo "PassEnv DB_PASSWORD" >> /etc/apache2/apache2.conf
echo "PassEnv PAYSTACK_PUBLIC_KEY" >> /etc/apache2/apache2.conf
echo "PassEnv PAYSTACK_SECRET_KEY" >> /etc/apache2/apache2.conf
echo "PassEnv FCM_SERVER_KEY" >> /etc/apache2/apache2.conf

# Execute the main command (apache2-foreground)
exec "$@"
