import * as path from 'path';

console.log(path);
export const __project_dir = path.join(__dirname, '..');
export const __data_dir = path.join(__project_dir, 'data');

export const STOCKS_SOCKET_URI = 'http://localhost:3000/stocks';
