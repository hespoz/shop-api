const express = require("express");
const request = require("supertest");
const moment = require('moment');
const app = express();
const indexRouter = require('.');

app.use("/", indexRouter);

describe('Api scenarios', () => {

    it('When wrong type in parameters are provided', async () =>  {
        const { body, status } = await request(app).get("/popular?date=NoValidDate&limit=NoValidLimit");
        expect(status).toEqual(422);
        expect(body).toEqual({
            "errors": [
                {
                    "location": "query",
                    "msg": "This is not a valid date please use YYYY-MM-DD format",
                    "param": "date",
                    "value": "NoValidDate"
                },
                {
                    "location": "query",
                    "msg": "Limit must be a number",
                    "param": "limit",
                    "value": "NoValidLimit"
                }
            ]
        });
    });

    it('When no params provided - here we check if the start are ordered correctly', async () =>  {
        const { body:{ items } } = await request(app).get("/popular");
        for(let i=1; i<items.length; i++){
            expect(items[i-1].stargazers_count).toBeGreaterThanOrEqual(items[i].stargazers_count);
        }
    });

    it('When limit param is provided', async () =>  {
        const { body:{ items } } = await request(app).get("/popular?limit=1");
        expect(items.length).toEqual(1);
    });

    it('When language and limit are provided', async () =>  {
        const NOW = moment().format("x");
        const LANG = 'Python';
        const LIMIT = 100;
        const { body:{ items } } = await request(app).get(`/popular?lang=${LANG}&limit=${LIMIT}`);

        expect(items.length).toBeLessThanOrEqual(LIMIT);

        for(const item of items){
            expect(item.language).toEqual(LANG);
            expect(parseInt(moment(item.created_at).format("x"))).toBeLessThanOrEqual(parseInt(NOW));
        }
    });

    it('When date, language and limit are provided', async () =>  {
        const DATE = '2018-01-01';
        const LANG = 'Python';
        const LIMIT = 100;
        const { body:{ items } } = await request(app).get(`/popular?lang=${LANG}&limit=${LIMIT}&date=${DATE}`);

        expect(items.length).toBeLessThanOrEqual(LIMIT);

        for(const item of items){
            expect(item.language).toEqual(LANG);
            expect(parseInt(moment(item.created_at).format("x"))).toBeGreaterThanOrEqual(parseInt(moment(DATE).format("x")));
        }
    });

});
