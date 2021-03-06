module.exports = function(app, axios, cheerio, db) {
  app.get(`/scrape`, function(req, res) {
    axios.get(`https://www.nytimes.com/section/technology`).then(function(response) {
      const $ = cheerio.load(response.data);

      // ? This finds anything that has the class name of `div.css-4jyr1y` and makes its elements usable to us
      $(`div.css-4jyr1y`).each(function(i, element) {
        const result = {};
        result.headline = $(this)
          .find(`h2`)
          .text();
        result.url = `https://www.nytimes.com${$(this)
          .children(`a`)
          .attr(`href`)}`;
        result.summary = $(this)
          .find(`p.css-1echdzn`)
          .text();
        result.image = $(this)
          .find(`figure`)
          .attr(`itemid`);
        result.author = $(this)
          .find(`span.css-1n7hynb`)
          .text();

        db.Scrape.find({}).then(function(allResults) {
          if (
            allResults.every(function(dataEntry) {
              return dataEntry.Headline !== result.Headline;
            })
          ) {
            // * If new scraped data is not a duplicate
            // * Create a new Scrape using the `result` object built from scraping
            db.Scrape.create(result)
              .then(function(dbScrape) {
                console.log(dbScrape);
              })
              .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
              })
              .then(function() {
                // Send a message to the client
                res.send(`New articles have been scraped!
<a href="/articles"><button>See All Articles</button></a>`);
              });
          } else {
            // Send a message to the client
            res.send(`There were no new articles to scrape!
<a href="/articles"><button>See All Articles</button></a>`);
          }
        });
      });
    });
  });

  app.post(`/saveComment/:id`, function(req, res) {
    db.Note.create(req.body)
      .then(function(dbNote) {
        console.log(dbNote);
        // * If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // * { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // * Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Scrape.update({ _id: req.params.id }, { $push: { note: dbNote } }, { new: true });
      })
      .then(function(dbScrape) {
        res.json(dbScrape);
      })
      .catch(function(err) {
        // ! If an error occurred, log it
        console.log(err);
      });
  });
};
