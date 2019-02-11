module.exports = function(app, db) {
  app.get(`/`, function(req, res) {
    res.render(`index`);
  });

  app.get(`/articles`, function(req, res) {
    db.Scrape.find({})
      .sort({ ObjectId: -1 })
      .then(function(dbScrape) {
        res.render(`articles`, {
          scrapedArticles: dbScrape,
        });
      });
  });

  app.get(`/articles/:id`, function(req, res) {
    db.Scrape.find({ _id: req.params.id }).then(function(dbScrape) {
      res.render(`articles`, {
        scrapedArticles: dbScrape,
      });
    });
  });

  app.get(`/articles/:id/comment`, function(req, res) {
    db.Scrape.find({ _id: req.params.id }).then(function(dbScrape) {
      res.render(`articleComment`, {
        scrapedArticles: dbScrape,
      });
    });
  });

  app.get(`*`, function(req, res) {
    res.redirect(`/articles`);
  });
};
