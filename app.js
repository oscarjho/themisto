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
      callbackurl: `https://ganymede2.herokuapp.com/api/product/search-order/${req.body._id}`
    },
    orderstatus: "processing",
    productresult: {}
  };

  res.json(searchorder);

  search(searchorder);
});

const search = (req) => {
  const query = req.searchdata.query;
  (async () => {
    /* Initiate the Puppeteer browser */
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

    page.once('load', () => console.log('Process Finished'));

    var result = await page.evaluate(() => {
      // Set the products
      let productos=[];
      // Find the products
      const productsElms = document.querySelectorAll('li[class="results-item highlighted article stack item-without-installmets"]');
      // Get every product
      productsElms.forEach((productelement) => { 
        let productJson = {};
        try {
          productJson.SKU = productelement.querySelector('div[class="rowItem item highlighted item--stack item--has-row-logo new "]').id,
          productJson.name = productelement.querySelector('span[class="main-title"]').innerText,
          productJson.price = productelement.querySelector('div[class="item__price "]').innerText,
          productJson.description = productelement.querySelector('div[class="item__condition"]').innerText,
          productJson.image = productelement.querySelector('img[class="lazy-load"]').src,
          productJson.relatedsearchqueries = document.querySelector('ul[class="related-searches__list"]').innerText
        } catch (exception){
			console.log(exception);
        }
        productos.push(productJson);
      });

      let removeObsoletesArray = []
        productos.forEach( element => {
          if(element.length > 0){
              removeObsoletesArray.push(element)
          }
        })

      return removeObsoletesArray;
      });

    console.log(result);

    //Object with the result
    let send = {
      _id: req._id,
      searchdata: req.searchdata,
      orderstatus: "fullfilled",
      productresult: result
    }
    
    console.log('ahora axios');
  
    //Send the result
    axios
      .post('https://ganymede2.herokuapp.com/api/product/save-search', send)
      .then(res => console.log('axios send'))
      .catch(err => console.log(err));

    await browser.close();
    
  })();
}

  