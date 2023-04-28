const PORT = process.env.PORT || 8080
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const newspapers = [
    {
        name: 'cityam',
        address: 'https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/',
        base: ''
    },
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: '',
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk',
    },
    {
        name: 'nyt',
        address: 'https://www.nytimes.com/international/section/climate',
        base: '',
    },
    {
        name: 'latimes',
        address: 'https://www.latimes.com/environment',
        base: '',
    },
    {
        name: 'smh',
        address: 'https://www.smh.com.au/environment/climate-change',
        base: 'https://www.smh.com.au',
    },
    {
        name: 'un',
        address: 'https://www.un.org/climatechange',
        base: '',
    },
    {
        name: 'bbc',
        address: 'https://www.bbc.co.uk/news/science_and_environment',
        base: 'https://www.bbc.co.uk',
    },
    {
        name: 'es',
        address: 'https://www.standard.co.uk/topic/climate-change',
        base: 'https://www.standard.co.uk'
    },
    {
        name: 'sun',
        address: 'https://www.thesun.co.uk/topic/climate-change-environment/',
        base: ''
    },
    {
        name: 'dm',
        address: 'https://www.dailymail.co.uk/news/climate_change_global_warming/index.html',
        base: ''
    },
    {
        name: 'nyp',
        address: 'https://nypost.com/tag/climate-change/',
        base: ''
    }
]

const fetchArticles = async () => {
  const allArticles = []

  for (const newspaper of newspapers) {
    try {
      const response = await axios.get(newspaper.address)
      const html = response.data
      const $ = cheerio.load(html)

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text()
        const url = $(this).attr('href')

        allArticles.push({
          title,
          url: newspaper.base + url,
          source: newspaper.name
        })
      })
    } catch (err) {
      console.error(`Error fetching articles from ${newspaper.name}: ${err.message}`)
    }
  }

  return allArticles
}

app.use(express.json())

app.get('/', (req, res) => {
  res.json('Welcome to my Climate Change News API')
})

app.get('/news', async (req, res) => {
  try {
    const articles = await fetchArticles()
    res.json(articles)
  } catch (err) {
    console.error(`Error fetching articles: ${err.message}`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/news/:newspaperId', async (req, res) => {
  const { newspaperId } = req.params
  const newspaper = newspapers.find(newspaper => newspaper.name === newspaperId)

  if (!newspaper) {
    return res.status(404).json({ error: 'Newspaper not found' })
  }

  try {
    const response = await axios.get(newspaper.address)
    const html = response.data
    const $ = cheerio.load(html)
    const specificArticles = []

    $('a:contains("climate")', html).each(function () {
      const title = $(this).text()
      const url = $(this).attr('href')
      specificArticles.push({
        title,
        url: newspaper.base + url,
        source: newspaperId
      })
    })

    res.json(specificArticles)
  } catch (err) {
    console.error(`Error fetching articles from ${newspaper.name}: ${err.message}`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
