## Heroku Configuration

### Backend -- Main.py --> CORS Middleware update the following
```allow_origins=["https://taskmaster-app-frontend-0d9ba97b97d1.herokuapp.com"]```
### post update that line in CORS has to be the one below allowing both localhost and the deployed frontend app
``` allow_origins=["https://taskmaster-app-frontend-0d9ba97b97d1.herokuapp.com","http://localhost:3000"],  # Your React frontend URL```


### goto frontend/src/services/api.js --> Update the backend api url
```baseURL: process.env.REACT_APP_API_URL || 'https://taskmaster-api-990d28ee08e0.herokuapp.com/api',```

### Create a file --->.env.production this is the location of the backend endpoint url from heroku

```REACT_APP_API_URL=https://taskmaster-api-990d28ee08e0.herokuapp.com/api```

### in Frontend create a static.json with the content below
{
  "root": "build/",
  "routes": {
    "/**": "index.html"
  }
}

### At the root folder (todo-List) Create package.json with the following 
{
  "name": "taskmaster",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": "16.x",
    "npm": "8.x"
  },
  "scripts": {
    "heroku-prebuild": "cd $PROJECT_PATH && npm install",
    "heroku-postbuild": "cd $PROJECT_PATH && npm run build",
    "start": "cd $PROJECT_PATH && npm start"
  }
}


### At the root folder create a Procfile


### At the root level create runtime.txt ---> this is to specify runtime supported language
```python-3.10```



### Deployment instructions


## install Heroku client  
```npm install -g heroku```


# Login to Heroku
```heroku login```

# Create backend app ( This name has to be customized and that is what will get displayed at the heroku end)
```heroku create tm-api```
## once you create the above you will be getting root url for the backend application use this Url to update in api.js and .env.production




# Create frontend app
```heroku create tm-app```

## once you get create the frontend root url changes has to be done in Main.py

## Do the following in the root level (todo_list)
 ```git add .```
```git commit -m "First heroku checkin"```


# Deploy Backend APP 
```heroku git:remote -a tm-api```


## Add PostgreSQL to your backend app
```heroku addons:create heroku-postgresql:essential-0 -a tm-api```

```git push heroku main```

## Initialize database for the first time
```heroku run python backend/init_db.py -a tm-api```

## Run the admin user creation script
```heroku run python backend/create_admin.py -a tm-api```

# start backend Application -- post deployement we are starting the backend after initating db creating a entryUser 
```heroku ps:scale web=1 -a tm-api```

# logs to validate if backend is working fine
```heroku logs --tail -a tm-api```

# completes the backend deployment -- verify by the  curl https://tm-api-e1bc89921dc6.herokuapp.com 


# Verify user creation via backend
 curl -X POST https://tm-api-e1bc89921dc6.herokuapp.com/api/auth/login \ 
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gmail.com", "password": "admin123"}'



# FRONT END DEPLOYMENT

## create a new directory for deploying frontend -- > cd ~
```mkdir ~/tm-frontend-deploy```

## initialize a empty git in this path --> git init

## create package.json with the following content --> sudo nano package.json


{
  "name": “tm01-app”,
  "version": "1.0.0",
  "engines": {
    "node": "16.x",
    "npm": "8.x"
  },
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}

## create server.js with the following content --> sudo nano server.js


const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});


## copy the build directory from frontend to tm-frontend-deploy/
```cp -r build/ ~/tm-frontend-deploy/```
### Note : check for string literals in package.json and server.js files

## install the node packages -- > npm install

## git add .

## git commit -m ""


## connect to heroku frontend app before pushing the code
```heroku git:remote -a tm01-app ```

```git push heroku main```







