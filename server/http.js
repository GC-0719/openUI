export const json = (res, code, data) => {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(code);
  res.end(JSON.stringify(data));
};

export const readBody = (req) => new Promise(resolve => {
  let b = '';
  req.on('data', c => { b += c; });
  req.on('end', () => resolve(b));
});
