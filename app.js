const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const puppeteer = require('puppeteer');

//Init app
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set port
const port = process.env.PORT || 3000;
//Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));

// @route   GET /
// @desc    / 
// @access  Public
app.get('/', (req, res) => res.json({ msg: 'themisto' }));

//Route
app.post('/search', function(req, res) {
  // Get query on get.body
  const searchorder = {
    _id: req.body._id,
    searchdata: {
      query: req.body.searchdata.query,
      provider: req.body.searchdata.provider,
      options: {user: req.body.searchdata.options.user, password: req.body.searchdata.options.password},
      callbackurl: req.body.searchdata.callbackurl,
    },
    orderstatus: "processing"
  };

  res.json(searchorder);
  console.log(searchorder);
  console.log('ahora puppeteer');

  search(searchorder);
});


const search = (req) => { 
  const query = req.searchdata.query;
  (async () => {
    // Initiate the Puppeteer browser 
    const browser = await puppeteer.launch({ 
      headless: true,
      'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const page = await browser.newPage();

    /* Go to the IMDB Movie page and wait for it to load */
    await page.goto(
      `https://listado.mercadolibre.com.ve/${query}`,
      { waitUntil: 'networkidle2' });

    const urls = await page.evaluate(() => Array.from(document.querySelectorAll('.item__info-title'), element => element.href));

    if (urls.length > 0 ) {
      var data = [];
      // for (let i = 0, total_urls = urls.length; i < total_urls; i++)
      for (let i = 0; i < 2; i++) {
        await page.goto(urls[i]);

        // Get the data ...
        let result = {};
        result.SKU = await page.evaluate(() => document.querySelector('span[class="item-info__id-number"]').innerText );
        result.title = await page.evaluate(() => document.querySelector('h1[class="item-title__primary "]').innerText);
        result.description = await page.evaluate(() => document.querySelector('div[class="item-description__text"]').innerText);
        result.price = await page.evaluate( () => document.querySelector('span[class="price-tag"]').innerText);
        result.images = await page.evaluate( () =>  {
          let images = [];
          let size = document.querySelectorAll('.gallery__thumbnail').length;
          if(size == 0 ) {
            let image = document.querySelector('#gallery_dflt > div > figure > a > img').src;
            images.push(image);
          } else {
            for (let i = 0; i < size; i++) {
            let selector = `label[for="thumbgallery_default-${i}"] > img`;
            let image = document.querySelector(selector).src;
            images.push(image);
            }
          }
        return images;
        }); //Close images result
      
        data.push(result);
      } //Close result bucle when done
    } else {
      let data = {}
    }

    console.log(data);

    //Object with the result
    let send = {
      _id: req._id,
      searchdata: req.searchdata,
      orderstatus: "fullfilled",
      productresult: data
    }

    //Send the result
    axios
      .post(req.searchdata.callbackurl, send)
      .then(res => console.log('axios send', req.searchdata.callbackurl))
      .catch(err => console.log(err));

    await browser.close();

  })(); //Close async
}// Close Search
  
    
