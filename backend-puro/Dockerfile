# PHP 8.2 + Apache — supports .htaccess mod_rewrite out of the box
FROM php:8.2-apache

# Enable mod_rewrite for .htaccess routing
RUN a2enmod rewrite

# Install PDO MySQL and other extensions
RUN docker-php-ext-install pdo pdo_mysql

# Set DocumentRoot to /public (where index.php lives)
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf && \
    sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Allow .htaccess to override config
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Copy all source code (src/ and public/) into the container
COPY . /var/www/html/

# Fix permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
