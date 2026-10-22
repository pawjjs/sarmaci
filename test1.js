import { createServer } from 'node:http'
import { writeFile } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'

const server = createServer((req, res) => {
// specyfikujemy nagłówki
res.setHeader(
'Content-Type',
'text/plain; charset=utf-8'
)
// tworzymy ciało odpowiedzi
res.write('Hello, ')
res.end('world!')
})


await writeFile(
'./data/result1.txt',
'Hello, Node!'
)

console.log('Zapisano plik')

const text = await readFile(
'./data/result2.txt',
'utf8'
)
console.log(text)

server.listen(3000)