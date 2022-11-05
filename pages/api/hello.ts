// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { CookieSerializeOptions } from 'next/dist/server/web/spec-extension/cookies/types';

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if (typeof options.maxAge === 'number') {
    options.expires = new Date(Date.now() + options.maxAge * 1000)
  }

  res.setHeader('Set-Cookie', JSON.stringify({ name, stringValue, options }))
}

type Data = {
  name: string,
  method?: string,
  env: any,
  body?: any,
  path?: string,
  secret1?: string,
  secret2?: string,
  secret12?: string,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Run the middleware
  await runMiddleware(req, res, cors)

  // Calling our pure function using the `res` object, it will add the `set-cookie` header
  // Add the `set-cookie` header on the main domain and expire after 30 days
  setCookie(res, 'Next.js', 'api-middleware!', { path: '/', maxAge: 2592000 });
  // Return the `set-cookie` header so we can display it in the browser and show that it works!
 //res.end(res.getHeader('Set-Cookie'));

  res.status(200).json({ 
    name: 'John Doe', 
    method: req.method,
    env: req.env,
    body: req.body,
    path: '',
    secret1: process.env.VAR1,
    secret2: process.env.VAR2,
    secret12: process.env.VAR3,
  });
}