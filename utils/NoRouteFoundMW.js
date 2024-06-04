const noRouteFound = (app)=>{
    
    app.use((req, res, next) => {
        res.status(404);
        res.json({ message: "COULD NOT FIND THIS ROUTE" });
        return next();
      });
}

  module.exports = noRouteFound;
  
