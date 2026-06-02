# Resource service

The Resource Service is a RESTful API responsible for managing resources in the system. It should follow the API documentation provided at the following link: [https://courselab.lnu.se/picture-it/api/v1/docs/]. While it is possible to extend the API, the endpoints described in the documentation must still work and provide at least the data specified.

There are a few things to note when implementing the Resource Service:

- The default maximum payload size for the body-parser JSON in Express is 100kb. However, your application should be able to handle larger images, so the limit should be extended to 500kb using the following code:

  ```javascript
  app.use(express.json({ limit: "500kb" }))
  ```

  For more information, see the Express documentation: [http://expressjs.com/en/api.html#express.json].

- In a microservice architecture, it is recommended that each service runs its instance of MongoDB, even if it is possible to use the same one or an existing one on the production server. This helps to decouple services and make them easier to develop, deploy, and scale independently. To achieve this, you can start different containers of the same image on the production server or localhost, and let the Resource Service connect to port 27017.

  ```bash
  $ docker run -d -p 27017:27017 --name mongodb-resource mongo:6.0.4
  54b0c78a016d36b2eca2dfa42a8eeabd1a2596bb6acd2721d21bd57cbc6fc381

  $ docker run -d -p 27018:27017 --name mongodb-auth mongo:6.0.4
  15ce7744f18deedcfdac35839e3f8b184f2e6c83222e79b5ea89ac561dfbb885

  $ docker ps
  CONTAINER ID   IMAGE         COMMAND                  CREATED         STATUS             PORTS                      NAMES
  15ce7744f18d   mongo:6.0.4   "docker-entrypoint.s…"   8 seconds ago   Up 6 seconds       0.0.0.0:27018->27017/tcp   mongodb-auth
  54b0c78a016d   mongo:6.0.4   "docker-entrypoint.s…"   6 weeks ago     Up About an hour   0.0.0.0:27017->27017/tcp   mongodb-resource
  ```
