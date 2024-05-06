Kiraka is a speed-reading platform designed to adapt to the users' reading speed and push users to improve their reading speed. It is currently hosted at srp.doc.ic.ac.uk.

Authentication is handled by Clerk, which creates an id for each user. This id is the only piece of user authentication we store.

Add your clerk api keys and instructions after sign-in/sign-up to .env.local file
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your public clerk key"
CLERK_SECRET_KEY="secret key"

NEXT_PUBLIC_CLERK_SIGN_IN_URL=""
NEXT_PUBLIC_CLERK_SIGN_UP_URL=""
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=""
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=""

```

## Running the project

The project runs with Next.js and a MariaDB database, both of which need to be installed.
Our backend uses Flask, so we recommend downloading Python 3.10 and creating a virtual environment: 
```bash
python3.10 -m venv <your venv name>
```

Create a database in MariaDB

In /api, create a file called config.py which should contain your DATABASE_URI 
(eg: `mariadb+mariadbconnector://<mariadb_username>:<mariadb_password>@localhost/<database_name>`) and your ADMIN_ID (eg: 1, or your clerk_id)

To run the development server:

```bash
npm run dev
```

To run the production server:
```bash
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the website.

Our website is deployed in a similar fashion on one of Imperial's virtual machines, where both the frontend and the backend are hosted. 