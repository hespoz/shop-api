
const express = require('express');
const axios = require('axios');
const moment = require('moment');
const { query, validationResult } = require('express-validator');

const router = express.Router();

const GITHUB_API_URI ='https://api.github.com/search/repositories?sort=stars&order=desc';

router.get('/popular',
    [
      query('date').optional().matches(/^\d{4}-[0-1][0-2]-[0-3]\d$/).withMessage('This is not a valid date please use YYYY-MM-DD format'),
      query('lang').optional().isString().withMessage('Enter a programing language name.'),
      query('limit').optional().isInt().withMessage('Limit must be a number'),
    ],

    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }

        const { date, lang, limit } = req.query;

        let query = 'q=';

        /*
         * If no date is provided, we filter all the repositories created
         * before the current date.
         */
        if (date) {
          query = `${query}created:>=${date}`;
        }else{
          query = `${query}created:<=${moment().format('YYYY-MM-DD')}`;
        }

        if (lang) {
          query = `${query}+language:${lang}`;
        }

        if (limit) {
          query = `${query}&per_page=${limit}`
        }

        const response = await axios.get(`${GITHUB_API_URI}&${query}`);

        res.send(response.data);
});


module.exports = router;
