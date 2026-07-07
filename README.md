# Savory Restaurant Management System

A production-ready full-stack application built with Spring Boot and React, deployed natively on an Ubuntu EC2 instance using Systemd and NGINX.

Live http://13.204.232.249/

## Architecture

This project strictly adheres to standard Linux deployment architecture:
- **Spring Boot (Backend)**: Runs as a managed `systemd` service on `127.0.0.1:8080`, completely isolated from the public internet.
- **React (Frontend)**: Pre-compiled via Vite and served statically by NGINX.
- **NGINX**: The sole public entry point (Port 80/443). Serves React static files and reverse-proxies `/api/*` traffic to the backend.
- **MySQL**: Runs locally on the EC2 instance on Port 3306.

## Structure
- `/restaurant-management-Sys/`: Spring Boot Java Source Code
- `/frontend/`: React Vite Source Code
- `/deploy-to-ec2.sh`: The automated bash script for compiling and deploying to production.
- `/savory-backend.service`: Production Systemd unit file.
- `/nginx.conf`: Production NGINX server block config.

## Deployment

To deploy this application to your production EC2 instance, you must configure a local `.env` file first.

Refer to the complete [Deployment Guide](deployment-guide.md) for full server setup, SSL configuration, and deployment instructions.
