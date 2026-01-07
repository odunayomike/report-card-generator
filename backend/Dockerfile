FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Enable Apache mod_rewrite
RUN a2enmod rewrite headers

# Set working directory
WORKDIR /var/www/html

# Install Composer first
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files for dependency installation (better layer caching)
COPY composer.json composer.lock ./

# Install PHP dependencies before copying all files
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist \
    && composer dump-autoload --optimize \
    && ls -la vendor/ \
    && echo "Composer dependencies installed successfully"

# Now copy all application files
COPY . /var/www/html/

# Create config files from templates (force overwrite if they exist)
RUN rm -f /var/www/html/config/env.php \
           /var/www/html/config/cors.php \
           /var/www/html/config/database.php \
           /var/www/html/config/paystack.php && \
    cp /var/www/html/config/env.template.php /var/www/html/config/env.php && \
    cp /var/www/html/config/cors.template.php /var/www/html/config/cors.php && \
    cp /var/www/html/config/database.template.php /var/www/html/config/database.php && \
    cp /var/www/html/config/paystack.template.php /var/www/html/config/paystack.php

# Create necessary directories and set permissions
RUN mkdir -p /var/www/html/temp /var/www/html/uploads && \
    chmod -R 755 /var/www/html/temp /var/www/html/uploads /var/www/html/vendor && \
    chown -R www-data:www-data /var/www/html && \
    echo "Verifying vendor directory:" && \
    ls -la /var/www/html/vendor/phpmailer/ || echo "PHPMailer not found!"

# Install Node.js dependencies for Puppeteer
RUN cd /var/www/html && npm install

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable for Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Configure Apache DocumentRoot to point to backend directory
ENV APACHE_DOCUMENT_ROOT /var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Set ServerName to suppress warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Update Apache configuration for .htaccess support
RUN echo '<Directory /var/www/html>' >> /etc/apache2/apache2.conf && \
    echo '    Options Indexes FollowSymLinks' >> /etc/apache2/apache2.conf && \
    echo '    AllowOverride All' >> /etc/apache2/apache2.conf && \
    echo '    Require all granted' >> /etc/apache2/apache2.conf && \
    echo '</Directory>' >> /etc/apache2/apache2.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Start Apache with entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["apache2-foreground"]
