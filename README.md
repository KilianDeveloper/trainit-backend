# TrainItBackend

## Installation

### Database

- Install at least MySQL 8 on your machine, on which the docker-container will run
- Create a new database with the following statement

        create database YOUR_DATABASE_HERE;

- Create a new user and grant him all privileges

        CREATE USER 'YOUR_USERNAME'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';
        GRANT ALL PRIVILEGES ON *.* TO 'YOUR_USERNAME'@'localhost' WITH GRANT OPTION;

### Configuration

- Make sure, the Database-Server is started
- Create a new File .env in the the current Dictionary
- Copy the content from .env.local to .env, but without spaces and without ';'
- Insert the Database Credentials and Connection-Data of your local Database, which you created in [Database](#database)
- For the DB Host, use "host.docker.internal", when you use basic docker configuration
- Insert for MY_SQL_DB_CONNECTION_LIMIT=4 and for NODE_TLS_REJECT_UNAUTHORIZED=0
- set USE_LETS_ENCRYPT to false in Development-Phase
- Copy your firebase configuration file as "firebase_config.json" in "src/certificates/firebase_config.json"

### Start the app (in Dev Mode)

        docker-compose -f docker-compose.dev.yml up --build

### Debugging

- Attach the Launch "Docker: Attach to Node" in VS-Code

### Server Installation

- Build the Container with Docker

        docker-compose -f docker-compose.yml up --build -d

## Get mysql password

        cat /etc/psa/.psa.shadow

### Create Database Migrations

- **be sure, that your SQL-Script doesn't contain errors**
- to create Database-Migrations, create .sql-Files in the folder, that you provided in .env for MY_SQL_MIGRATION_SCRIPT_FOLDER_PATH
- name the file with the next number after the last files and a short description, seperated with "_" (max. 4 words)
- run the Database Manager, to automatically execute the migration-files (**don't execute them on your own!**)

### Good to know

- When deleting a Migration, it wont be deleted in the build-folder and wont be deleted there. It will still be used
- When changing some data of an account (also connected tables as training-plans), you need to chamge the last_modified column

## Project Structure

## Work-Flows

### Email Invitation to a Group - A Sender wants to send the Receiver an Invitation to a group

1. the sender requests a new link to share the group from the backend
2. the backend generates a new link and saves it in the table "group_invitations"
3. the backend returns the link to the sender
4. the sender shares the link about any media (p.e over mail) with the receiver
5. the receiver sends the link to the backend to join the group
6. the backend checks, if the link is correct
7. if the link is correct, the backend will add the user to the requested group
8. the backend returns the result of the action to the receiver

## Models

### Account or User

- User-Data can be requested by anyone, the Account-Data contains more secure data and can only be requested by the user itself
