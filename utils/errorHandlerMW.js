const errorHandler=(app)=>{
    app.use((error, req, res, next) => {
        if (res.headerSent) {
          return next(error);
        }
      
        res.status(error.code || 500);
        res.json({ message: error.message || "SOMETHING WENT WRONG" });
      });
};

module.exports = errorHandler;